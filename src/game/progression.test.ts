import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REWARDS,
  applyCollectRelicReward,
  applyMiniGameReward,
  applyReadInfoReward,
  applyTalkGuideReward,
  areAllLocationsCompleted,
  calculateLocationStars,
  createInitialProgress,
  getCompletedLocationsCount,
  getLevelInfo,
  getTotalStars,
  isLocationUnlocked,
} from './progression';
import { floodFillBorderRgba } from './spriteFloodFill';
import { LOCATIONS } from '../data/locations';
import { computeSpatialAttenuation, getLocationSpatialSources } from '../audio/spatialMath';
import { selectGaitAction } from './gaitLogic';

test('initial progress unlocks only location 1 and starts at level 1', () => {
  const p = createInitialProgress('Budi');
  assert.equal(p.playerName, 'Budi');
  assert.equal(p.xp, 0);
  assert.equal(p.coins, 0);
  assert.equal(getLevelInfo(p.xp).level, 1);
  assert.equal(getLevelInfo(p.xp).title, 'Penjelajah Muda');

  assert.equal(isLocationUnlocked(p, 'benteng-kuto-besak'), true);
  assert.equal(isLocationUnlocked(p, 'museum-smb2'), false);
  assert.equal(isLocationUnlocked(p, 'taman-purbakala'), false);
});

test('completing all missions in location 1 awards 3 stars, exact XP/coins, badge, and unlocks location 2', () => {
  let p = createInitialProgress('Sari');
  const loc1 = LOCATIONS[0];

  const talkRes = applyTalkGuideReward(p, loc1.id);
  assert.equal(talkRes.awarded, true);
  p = talkRes.next;
  assert.equal(p.xp, REWARDS.TALK_GUIDE.xp);
  assert.equal(p.coins, REWARDS.TALK_GUIDE.coins);

  // Idempotent duplicate talk does not double-award
  const talkDup = applyTalkGuideReward(p, loc1.id);
  assert.equal(talkDup.awarded, false);
  assert.equal(talkDup.next.xp, p.xp);

  p = applyReadInfoReward(p, loc1.id).next;
  for (const relic of loc1.relics) {
    p = applyCollectRelicReward(p, loc1.id, relic.id).next;
  }
  assert.equal(isLocationUnlocked(p, 'museum-smb2'), false);

  p = applyMiniGameReward(p, loc1.id).next;

  const expectedXp =
    REWARDS.TALK_GUIDE.xp +
    REWARDS.READ_INFO.xp +
    REWARDS.FIND_RELIC.xp * 3 +
    REWARDS.COMPLETE_MINIGAME.xp;
  const expectedCoins = REWARDS.TALK_GUIDE.coins + REWARDS.COMPLETE_MINIGAME.coins;

  assert.equal(p.xp, expectedXp); // 220 XP
  assert.equal(p.coins, expectedCoins); // 55 Coins
  assert.equal(p.locations[loc1.id].stars, 3);
  assert.equal(getTotalStars(p), 3);
  assert.equal(getCompletedLocationsCount(p), 1);
  assert.ok(p.badges.includes(loc1.badgeId));
  assert.equal(isLocationUnlocked(p, 'museum-smb2'), true);
  assert.equal(isLocationUnlocked(p, 'jembatan-ampera'), false);
});

test('completing all 6 locations yields 18 stars, 6 badges, and Penjaga Warisan Sriwijaya title', () => {
  let p = createInitialProgress('Nadia');
  for (const loc of LOCATIONS) {
    p = applyTalkGuideReward(p, loc.id).next;
    p = applyReadInfoReward(p, loc.id).next;
    for (const relic of loc.relics) {
      p = applyCollectRelicReward(p, loc.id, relic.id).next;
    }
    p = applyMiniGameReward(p, loc.id).next;
  }

  assert.equal(getTotalStars(p), 18);
  assert.equal(p.badges.length, 6);
  assert.equal(areAllLocationsCompleted(p), true);
  assert.equal(getLevelInfo(p.xp).title, 'Penjaga Warisan Sriwijaya');
});

test('calculateLocationStars handles partial progress accurately', () => {
  assert.equal(
    calculateLocationStars({
      talkedToGuide: false,
      readInfoBoard: false,
      collectedRelics: [],
      completedMiniGame: false,
      stars: 0,
    }),
    0,
  );
  assert.equal(
    calculateLocationStars({
      talkedToGuide: true,
      readInfoBoard: false,
      collectedRelics: [],
      completedMiniGame: false,
      stars: 0,
    }),
    1,
  );
  assert.equal(
    calculateLocationStars({
      talkedToGuide: false,
      readInfoBoard: false,
      collectedRelics: [],
      completedMiniGame: true,
      stars: 0,
    }),
    2,
  );
});

test('floodFillBorderRgba clears outer border color while preserving enclosed interior pixels of same color', () => {
  // 5x5 grid with white border (255,255,255), dark outline at ring 1, and white center pixel (2,2)
  const w = 5;
  const h = 5;
  const buf = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const isRing1 =
        (x >= 1 && x <= 3 && (y === 1 || y === 3)) ||
        (y >= 1 && y <= 3 && (x === 1 || x === 3));
      if (isRing1) {
        buf[idx] = 20;
        buf[idx + 1] = 20;
        buf[idx + 2] = 20;
        buf[idx + 3] = 255;
      } else {
        buf[idx] = 255;
        buf[idx + 1] = 255;
        buf[idx + 2] = 255;
        buf[idx + 3] = 255;
      }
    }
  }

  floodFillBorderRgba(buf, w, h, 20);

  // Outer corner (0,0) should be cleared (alpha = 0)
  assert.equal(buf[3], 0);
  // Dark outline at (1,1) should stay opaque
  assert.equal(buf[(1 * w + 1) * 4 + 3], 255);
  // Enclosed white pixel at center (2,2) should stay opaque!
  assert.equal(buf[(2 * w + 2) * 4 + 3], 255);
});

test('spatial audio fades smoothly from refDistance to maxDistance and pans left/right relative to yaw', () => {
  const atSource = computeSpatialAttenuation([9.5, 1.0, -6.5], 0, [9.5, 1.0, -6.5], 2.8, 13.0);
  assert.equal(atSource.gainFactor, 1);

  const tooFar = computeSpatialAttenuation([-10, 0, 10], 0, [9.5, 1.0, -6.5], 2.8, 13.0);
  assert.equal(tooFar.gainFactor, 0);

  const mid = computeSpatialAttenuation([3.0, 1.0, -6.5], 0, [9.5, 1.0, -6.5], 2.8, 13.0);
  assert.ok(mid.gainFactor > 0.1 && mid.gainFactor < 0.9);
  assert.ok(mid.pan > 0.5);

  const leftSide = computeSpatialAttenuation([-8.5, 1.0, -4.5], 0, [-15, 1.0, -4.5], 2.5, 12);
  assert.ok(leftSide.pan < -0.5);
});

test('all 6 locations define at least 3 3D spatial sound sources matched to landmarks/water/nature', () => {
  for (const loc of LOCATIONS) {
    const sources = getLocationSpatialSources(loc.id);
    assert.ok(sources.length >= 3, `${loc.id} should have >= 3 spatial sound sources`);
  }
});

test('selectGaitAction alternates intact walk/run stride frames and returns to idle ready stance when stopped', () => {
  const step0 = selectGaitAction({
    playerY: 0,
    currentSpeed: 3.5,
    hasMovementInput: true,
    isRunning: false,
    walkPhase: 0.2,
  });
  const step1 = selectGaitAction({
    playerY: 0,
    currentSpeed: 3.5,
    hasMovementInput: true,
    isRunning: false,
    walkPhase: Math.PI * 0.6,
  });
  const step2 = selectGaitAction({
    playerY: 0,
    currentSpeed: 3.5,
    hasMovementInput: true,
    isRunning: false,
    walkPhase: Math.PI * 1.4,
  });
  const step3 = selectGaitAction({
    playerY: 0,
    currentSpeed: 3.5,
    hasMovementInput: true,
    isRunning: false,
    walkPhase: Math.PI * 1.8,
  });

  assert.equal(step0, 'jalan');
  assert.equal(step1, 'jalan');
  assert.equal(step2, 'lari');
  assert.equal(step3, 'lari');

  // Releasing input snaps back to ready stance ('idle') quickly
  assert.equal(
    selectGaitAction({
      playerY: 0,
      currentSpeed: 0.9,
      hasMovementInput: false,
      isRunning: false,
      walkPhase: 0.3,
    }),
    'idle',
  );

  // Airborne stays lompat
  assert.equal(
    selectGaitAction({
      playerY: 0.5,
      currentSpeed: 2.0,
      hasMovementInput: true,
      isRunning: false,
      walkPhase: 0.2,
    }),
    'lompat',
  );
});

test('floodFillBorderRgba cleans semi-transparent outer sticker halos without removing solid sprite pixels', () => {
  const w = 5;
  const h = 5;
  const buf = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const isCenter = x >= 1 && x <= 3 && y >= 1 && y <= 3;
      buf[idx] = 220;
      buf[idx + 1] = 215;
      buf[idx + 2] = 210;
      buf[idx + 3] = isCenter ? 255 : 30;
    }
  }
  floodFillBorderRgba(buf, w, h, 24);
  assert.equal(buf[3], 0);
  assert.equal(buf[(2 * w + 2) * 4 + 3], 255);
});

test('all 18 relics across 6 locations have distinct realistic heritage iconTypes', () => {
  const seen = new Set<string>();
  for (const loc of LOCATIONS) {
    assert.equal(loc.relics.length, 3, `${loc.id} should define 3 relics`);
    for (const relic of loc.relics) {
      assert.ok(relic.iconType.length > 0, `${relic.id} needs an iconType`);
      assert.equal(seen.has(relic.iconType), false, `Duplicate iconType ${relic.iconType}`);
      seen.add(relic.iconType);
    }
  }
  assert.equal(seen.size, 18);
});

