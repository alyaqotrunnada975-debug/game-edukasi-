import { LOCATIONS } from '../data/locations';
import { AudioSettings, LocationId, LocationProgress, PlayerProgress } from '../types/game';

export const STORAGE_KEY = 'jelajah_sriwijaya_save_v1';

export const REWARDS = {
  TALK_GUIDE: { xp: 25, coins: 15 },
  READ_INFO: { xp: 30, coins: 0 },
  FIND_RELIC: { xp: 35, coins: 0 },
  COMPLETE_MINIGAME: { xp: 60, coins: 40 },
} as const;

export interface LevelInfo {
  level: number;
  title: string;
  currentXp: number;
  minXp: number;
  nextLevelXp: number | null;
  progressPercent: number;
}

const LEVEL_TIERS: { level: number; minXp: number; title: string }[] = [
  { level: 1, minXp: 0, title: 'Penjelajah Muda' },
  { level: 2, minXp: 100, title: 'Pengamat Sejarah' },
  { level: 3, minXp: 250, title: 'Pelayar Sungai Musi' },
  { level: 4, minXp: 450, title: 'Kurator Nusantara' },
  { level: 5, minXp: 700, title: 'Pujangga Sriwijaya' },
  { level: 6, minXp: 950, title: 'Penjaga Warisan Sriwijaya' },
];

export function createEmptyLocationProgress(): LocationProgress {
  return {
    talkedToGuide: false,
    readInfoBoard: false,
    collectedRelics: [],
    completedMiniGame: false,
    stars: 0,
  };
}

export function createDefaultAudioSettings(): AudioSettings {
  return {
    muted: false,
    musicVolume: 0.45,
    sfxVolume: 0.7,
  };
}

export function createInitialProgress(playerName = ''): PlayerProgress {
  const locations = {} as Record<LocationId, LocationProgress>;
  for (const loc of LOCATIONS) {
    locations[loc.id] = createEmptyLocationProgress();
  }
  return {
    playerName,
    xp: 0,
    coins: 0,
    badges: [],
    locations,
    audio: createDefaultAudioSettings(),
    finaleSeen: false,
  };
}

export function getLevelInfo(xp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(xp));
  let activeTier = LEVEL_TIERS[0];
  let nextTier: (typeof LEVEL_TIERS)[number] | null = LEVEL_TIERS[1] ?? null;

  for (let i = 0; i < LEVEL_TIERS.length; i++) {
    if (safeXp >= LEVEL_TIERS[i].minXp) {
      activeTier = LEVEL_TIERS[i];
      nextTier = LEVEL_TIERS[i + 1] ?? null;
    }
  }

  const progressPercent = nextTier
    ? Math.min(
        100,
        Math.round(((safeXp - activeTier.minXp) / (nextTier.minXp - activeTier.minXp)) * 100),
      )
    : 100;

  return {
    level: activeTier.level,
    title: activeTier.title,
    currentXp: safeXp,
    minXp: activeTier.minXp,
    nextLevelXp: nextTier ? nextTier.minXp : null,
    progressPercent,
  };
}

export function calculateLocationStars(loc: LocationProgress, totalRelics = 3): number {
  let stars = 0;
  const hasDiscovered = loc.talkedToGuide && loc.readInfoBoard;
  const hasAllRelics = loc.collectedRelics.length >= totalRelics;
  const hasMiniGame = loc.completedMiniGame;

  if (loc.talkedToGuide || loc.readInfoBoard || loc.collectedRelics.length > 0) {
    stars = 1;
  }
  if ((hasDiscovered && loc.collectedRelics.length >= 2) || hasMiniGame) {
    stars = 2;
  }
  if (hasDiscovered && hasAllRelics && hasMiniGame) {
    stars = 3;
  }
  return stars;
}

export function isLocationCompleted(loc: LocationProgress, totalRelics = 3): boolean {
  return (
    loc.talkedToGuide &&
    loc.readInfoBoard &&
    loc.collectedRelics.length >= totalRelics &&
    loc.completedMiniGame
  );
}

export function isLocationUnlocked(progress: PlayerProgress, locationId: LocationId): boolean {
  const index = LOCATIONS.findIndex((l) => l.id === locationId);
  if (index <= 0) return true;
  const prevLoc = LOCATIONS[index - 1];
  const prevProgress = progress.locations[prevLoc.id];
  return prevProgress ? isLocationCompleted(prevProgress, prevLoc.relics.length) : false;
}

export function getTotalStars(progress: PlayerProgress): number {
  return LOCATIONS.reduce((sum, loc) => {
    const p = progress.locations[loc.id];
    return sum + (p ? p.stars : 0);
  }, 0);
}

export function getCompletedLocationsCount(progress: PlayerProgress): number {
  return LOCATIONS.filter((loc) => {
    const p = progress.locations[loc.id];
    return p ? isLocationCompleted(p, loc.relics.length) : false;
  }).length;
}

export function areAllLocationsCompleted(progress: PlayerProgress): boolean {
  return getCompletedLocationsCount(progress) === LOCATIONS.length;
}

export function applyTalkGuideReward(progress: PlayerProgress, locationId: LocationId): {
  next: PlayerProgress;
  awarded: boolean;
} {
  const currentLoc = progress.locations[locationId] ?? createEmptyLocationProgress();
  if (currentLoc.talkedToGuide) {
    return { next: progress, awarded: false };
  }
  const locDef = LOCATIONS.find((l) => l.id === locationId);
  const updatedLoc: LocationProgress = {
    ...currentLoc,
    talkedToGuide: true,
  };
  updatedLoc.stars = calculateLocationStars(updatedLoc, locDef?.relics.length ?? 3);

  return {
    awarded: true,
    next: {
      ...progress,
      xp: progress.xp + REWARDS.TALK_GUIDE.xp,
      coins: progress.coins + REWARDS.TALK_GUIDE.coins,
      locations: {
        ...progress.locations,
        [locationId]: updatedLoc,
      },
    },
  };
}

export function applyReadInfoReward(progress: PlayerProgress, locationId: LocationId): {
  next: PlayerProgress;
  awarded: boolean;
} {
  const currentLoc = progress.locations[locationId] ?? createEmptyLocationProgress();
  if (currentLoc.readInfoBoard) {
    return { next: progress, awarded: false };
  }
  const locDef = LOCATIONS.find((l) => l.id === locationId);
  const updatedLoc: LocationProgress = {
    ...currentLoc,
    readInfoBoard: true,
  };
  updatedLoc.stars = calculateLocationStars(updatedLoc, locDef?.relics.length ?? 3);

  return {
    awarded: true,
    next: {
      ...progress,
      xp: progress.xp + REWARDS.READ_INFO.xp,
      locations: {
        ...progress.locations,
        [locationId]: updatedLoc,
      },
    },
  };
}

export function applyCollectRelicReward(
  progress: PlayerProgress,
  locationId: LocationId,
  relicId: string,
): {
  next: PlayerProgress;
  awarded: boolean;
} {
  const currentLoc = progress.locations[locationId] ?? createEmptyLocationProgress();
  if (currentLoc.collectedRelics.includes(relicId)) {
    return { next: progress, awarded: false };
  }
  const locDef = LOCATIONS.find((l) => l.id === locationId);
  const updatedLoc: LocationProgress = {
    ...currentLoc,
    collectedRelics: [...currentLoc.collectedRelics, relicId],
  };
  updatedLoc.stars = calculateLocationStars(updatedLoc, locDef?.relics.length ?? 3);

  return {
    awarded: true,
    next: {
      ...progress,
      xp: progress.xp + REWARDS.FIND_RELIC.xp,
      locations: {
        ...progress.locations,
        [locationId]: updatedLoc,
      },
    },
  };
}

export function applyMiniGameReward(progress: PlayerProgress, locationId: LocationId): {
  next: PlayerProgress;
  awarded: boolean;
} {
  const currentLoc = progress.locations[locationId] ?? createEmptyLocationProgress();
  const locDef = LOCATIONS.find((l) => l.id === locationId);
  const badgeId = locDef?.badgeId;
  const alreadyCompleted = currentLoc.completedMiniGame;

  const updatedLoc: LocationProgress = {
    ...currentLoc,
    completedMiniGame: true,
  };
  updatedLoc.stars = calculateLocationStars(updatedLoc, locDef?.relics.length ?? 3);

  const nextBadges =
    badgeId && !progress.badges.includes(badgeId)
      ? [...progress.badges, badgeId]
      : progress.badges;

  if (alreadyCompleted) {
    return {
      awarded: false,
      next: {
        ...progress,
        badges: nextBadges,
        locations: {
          ...progress.locations,
          [locationId]: updatedLoc,
        },
      },
    };
  }

  return {
    awarded: true,
    next: {
      ...progress,
      xp: progress.xp + REWARDS.COMPLETE_MINIGAME.xp,
      coins: progress.coins + REWARDS.COMPLETE_MINIGAME.coins,
      badges: nextBadges,
      locations: {
        ...progress.locations,
        [locationId]: updatedLoc,
      },
    },
  };
}

export function loadProgressFromStorage(): PlayerProgress {
  if (typeof window === 'undefined') return createInitialProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    const base = createInitialProgress(typeof parsed.playerName === 'string' ? parsed.playerName : '');

    const mergedLocations = { ...base.locations };
    if (parsed.locations) {
      for (const loc of LOCATIONS) {
        const savedLoc = parsed.locations[loc.id];
        if (savedLoc) {
          const entry: LocationProgress = {
            talkedToGuide: Boolean(savedLoc.talkedToGuide),
            readInfoBoard: Boolean(savedLoc.readInfoBoard),
            collectedRelics: Array.isArray(savedLoc.collectedRelics) ? savedLoc.collectedRelics : [],
            completedMiniGame: Boolean(savedLoc.completedMiniGame),
            stars: 0,
          };
          entry.stars = calculateLocationStars(entry, loc.relics.length);
          mergedLocations[loc.id] = entry;
        }
      }
    }

    return {
      playerName: typeof parsed.playerName === 'string' ? parsed.playerName : '',
      xp: typeof parsed.xp === 'number' && parsed.xp >= 0 ? parsed.xp : 0,
      coins: typeof parsed.coins === 'number' && parsed.coins >= 0 ? parsed.coins : 0,
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
      locations: mergedLocations,
      audio: {
        muted: Boolean(parsed.audio?.muted),
        musicVolume:
          typeof parsed.audio?.musicVolume === 'number'
            ? Math.min(1, Math.max(0, parsed.audio.musicVolume))
            : base.audio.musicVolume,
        sfxVolume:
          typeof parsed.audio?.sfxVolume === 'number'
            ? Math.min(1, Math.max(0, parsed.audio.sfxVolume))
            : base.audio.sfxVolume,
      },
      finaleSeen: Boolean(parsed.finaleSeen),
    };
  } catch {
    return createInitialProgress();
  }
}

export function saveProgressToStorage(progress: PlayerProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota issues safely
  }
}
