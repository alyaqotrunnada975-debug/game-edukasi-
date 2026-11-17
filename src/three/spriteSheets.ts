import * as THREE from 'three';
import { floodFillBorderRgba } from '../game/spriteFloodFill';
import { SpriteAction } from '../types/game';

export type CharacterKey = 'petualang' | 'kiko' | 'arya';

const ACTION_INDEX: Record<SpriteAction, number> = {
  idle: 0,
  jalan: 1,
  lari: 2,
  lompat: 3,
  melambai: 4,
  berbicara: 5,
  menunjuk: 6,
  merayakan: 7,
  jalan_alt: 2,
  lari_alt: 1,
};

const ATTACHED_SPRITE_URLS: Partial<Record<CharacterKey, string>> = {
  petualang: '/assets/aistudio/Adventurer_Girl_Action_Sprite_Sheet_ee60a4cc.png',
  kiko: '/assets/aistudio/Si_Kiko_Otter_Adventure_Sticker_Sheet_44537a0c.png',
  arya: '/assets/aistudio/Kak_Arya_Animated_Pose_Collection_0aae68cc.png',
};

const FLOOD_TOLERANCE: Record<CharacterKey, number> = {
  petualang: 24,
  kiko: 24,
  arya: 24,
};

const CELL_SIZE = 256;
const COLS = 4;
const ROWS = 2;

const sheetCache = new Map<CharacterKey, HTMLCanvasElement>();
const portraitCache = new Map<CharacterKey, string>();
const readyMap = new Map<CharacterKey, boolean>();
const loadingStarted = new Set<CharacterKey>();
const listeners = new Map<CharacterKey, Set<() => void>>();

function notifyListeners(character: CharacterKey): void {
  const set = listeners.get(character);
  if (!set) return;
  set.forEach((cb) => cb());
}

export function subscribeCharacterSheetReady(
  character: CharacterKey,
  cb: () => void,
): () => void {
  let set = listeners.get(character);
  if (!set) {
    set = new Set();
    listeners.set(character, set);
  }
  set.add(cb);
  return () => {
    set?.delete(cb);
  };
}

export function isCharacterSheetReady(character: CharacterKey): boolean {
  return readyMap.get(character) === true;
}

/**
 * Searches a small horizontal band near an expected grid divider to pick the cleanest
 * transparent column seam so wide limbs (like outstretched boots or tails) are never clipped.
 */
function findCleanVerticalDivider(
  data: Uint8ClampedArray,
  sheetW: number,
  yStart: number,
  yEnd: number,
  nominalX: number,
  searchRadius: number,
): number {
  const minX = Math.max(1, nominalX - searchRadius);
  const maxX = Math.min(sheetW - 2, nominalX + searchRadius);
  let bestX = nominalX;
  let bestWeight = Number.POSITIVE_INFINITY;

  for (let x = minX; x <= maxX; x++) {
    let weight = 0;
    for (let y = yStart; y < yEnd; y++) {
      const a = data[(y * sheetW + x) * 4 + 3];
      if (a > 60) weight += a;
    }
    // Slight tie-breaker preference toward nominal grid divider when empty
    const score = weight + Math.abs(x - nominalX) * 0.05;
    if (score < bestWeight) {
      bestWeight = score;
      bestX = x;
    }
  }
  return bestX;
}

function findCleanHorizontalDivider(
  data: Uint8ClampedArray,
  sheetW: number,
  sheetH: number,
  nominalY: number,
  searchRadius: number,
): number {
  const minY = Math.max(1, nominalY - searchRadius);
  const maxY = Math.min(sheetH - 2, nominalY + searchRadius);
  let bestY = nominalY;
  let bestWeight = Number.POSITIVE_INFINITY;

  for (let y = minY; y <= maxY; y++) {
    let weight = 0;
    const rowOff = y * sheetW * 4;
    for (let x = 0; x < sheetW; x++) {
      const a = data[rowOff + x * 4 + 3];
      if (a > 60) weight += a;
    }
    const score = weight + Math.abs(y - nominalY) * 0.05;
    if (score < bestWeight) {
      bestWeight = score;
      bestY = y;
    }
  }
  return bestY;
}

function processAttachedSpriteImage(
  character: CharacterKey,
  img: HTMLImageElement,
  targetCanvas: HTMLCanvasElement,
): void {
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  if (srcW < 8 || srcH < 8) return;

  // Clean the full 4x2 sheet first so poses near grid edges never lose boots/tails to seam bars
  const fullCanvas = document.createElement('canvas');
  fullCanvas.width = srcW;
  fullCanvas.height = srcH;
  const fullCtx = fullCanvas.getContext('2d', { willReadFrequently: true })!;
  fullCtx.clearRect(0, 0, srcW, srcH);
  fullCtx.drawImage(img, 0, 0);

  const fullImgData = fullCtx.getImageData(0, 0, srcW, srcH);
  floodFillBorderRgba(fullImgData.data, srcW, srcH, FLOOD_TOLERANCE[character]);
  fullCtx.putImageData(fullImgData, 0, 0);
  const fullData = fullImgData.data;

  const nominalCellW = Math.floor(srcW / COLS);
  const nominalCellH = Math.floor(srcH / ROWS);
  const midRowY = findCleanHorizontalDivider(fullData, srcW, srcH, nominalCellH, 24);
  const rowRanges: Array<[number, number]> = [
    [0, midRowY],
    [midRowY, srcH],
  ];

  interface PoseCrop {
    sx: number;
    sy: number;
    sw: number;
    sh: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    isJump: boolean;
  }

  const crops: PoseCrop[] = [];
  let maxPoseWidth = 1;
  let minTopGlobal = srcH;
  let maxBottomGlobal = 0;

  for (let row = 0; row < ROWS; row++) {
    const [ry0, ry1] = rowRanges[row];
    const colSplits = [0];
    for (let c = 1; c < COLS; c++) {
      colSplits.push(
        findCleanVerticalDivider(fullData, srcW, ry0, ry1, c * nominalCellW, 34),
      );
    }
    colSplits.push(srcW);

    for (let col = 0; col < COLS; col++) {
      const idx = row * COLS + col;
      const sx = colSplits[col];
      const ex = colSplits[col + 1];
      const sw = Math.max(1, ex - sx);
      const sh = Math.max(1, ry1 - ry0);

      let minX = sw;
      let maxX = 0;
      let minY = sh;
      let maxY = 0;
      for (let y = 0; y < sh; y++) {
        const rowOffset = (ry0 + y) * srcW * 4;
        for (let x = 0; x < sw; x++) {
          if (fullData[rowOffset + (sx + x) * 4 + 3] > 85) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (minX > maxX || minY > maxY) {
        minX = 0;
        maxX = sw - 1;
        minY = 0;
        maxY = sh - 1;
      }

      const poseW = maxX - minX + 1;
      if (poseW > maxPoseWidth) maxPoseWidth = poseW;
      if (minY < minTopGlobal) minTopGlobal = minY;
      // Exclude airborne jump pose (idx === 3) from grounded baseline
      if (idx !== 3 && maxY > maxBottomGlobal) {
        maxBottomGlobal = maxY;
      }

      crops.push({
        sx,
        sy: ry0,
        sw,
        sh,
        minX,
        maxX,
        minY,
        maxY,
        isJump: idx === 3,
      });
    }
  }

  if (minTopGlobal >= maxBottomGlobal) {
    minTopGlobal = 0;
    maxBottomGlobal = nominalCellH - 1;
  }

  const contentHeight = Math.max(1, maxBottomGlobal - minTopGlobal + 1);
  const paddingTop = 14;
  const paddingBottom = 14;
  const paddingX = 14;
  const targetWidth = CELL_SIZE - paddingX * 2;
  const targetHeight = CELL_SIZE - paddingTop - paddingBottom;
  const scale = Math.min(targetWidth / maxPoseWidth, targetHeight / contentHeight);

  const outCtx = targetCanvas.getContext('2d', { willReadFrequently: true })!;
  outCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

  crops.forEach((crop, idx) => {
    const col = idx % COLS;
    const row = Math.floor(idx / COLS);
    const cellOriginX = col * CELL_SIZE;
    const cellOriginY = row * CELL_SIZE;

    const poseCenterX = (crop.minX + crop.maxX) * 0.5;
    const drawW = (crop.maxX - crop.minX + 1) * scale;
    const drawH = (crop.maxY - crop.minY + 1) * scale;

    // Center pose horizontally inside the 256x256 cell with guaranteed >= 14px left/right padding
    const destX = cellOriginX + CELL_SIZE * 0.5 - (poseCenterX - crop.minX) * scale;

    // Preserve natural baseline while guaranteeing feet never clip below CELL_SIZE - paddingBottom
    let destBottomY =
      cellOriginY + CELL_SIZE - paddingBottom - (maxBottomGlobal - crop.maxY) * scale;
    const maxAllowedBottom = cellOriginY + CELL_SIZE - paddingBottom;
    if (destBottomY > maxAllowedBottom) destBottomY = maxAllowedBottom;
    let destY = destBottomY - drawH;
    const minAllowedTop = cellOriginY + paddingTop;
    if (destY < minAllowedTop) destY = minAllowedTop;

    outCtx.drawImage(
      fullCanvas,
      crop.sx + crop.minX,
      crop.sy + crop.minY,
      crop.maxX - crop.minX + 1,
      crop.maxY - crop.minY + 1,
      destX,
      destY,
      drawW,
      drawH,
    );
  });

  portraitCache.delete(character);
  readyMap.set(character, true);
  notifyListeners(character);
}

function startLoadingAttachedSheet(
  character: CharacterKey,
  canvas: HTMLCanvasElement,
): void {
  const url = ATTACHED_SPRITE_URLS[character];
  if (!url || loadingStarted.has(character) || typeof Image === 'undefined') return;
  loadingStarted.add(character);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    processAttachedSpriteImage(character, img, canvas);
  };
  img.src = url;
}

export function getCharacterSpriteSheet(character: CharacterKey): HTMLCanvasElement {
  const cached = sheetCache.get(character);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = CELL_SIZE * COLS; // 1024
  canvas.height = CELL_SIZE * ROWS; // 512 (clean 4x2 grid)
  sheetCache.set(character, canvas);

  startLoadingAttachedSheet(character, canvas);

  return canvas;
}

// Preload the 3 attached character sprite sheets immediately in the browser
if (typeof window !== 'undefined') {
  getCharacterSpriteSheet('petualang');
  getCharacterSpriteSheet('kiko');
  getCharacterSpriteSheet('arya');
}

const UV_PAD_X = 0.002;
const UV_PAD_Y = 0.002;

export function createCharacterBillboardTexture(
  character: CharacterKey,
): THREE.CanvasTexture {
  const sheet = getCharacterSpriteSheet(character);
  const tex = new THREE.CanvasTexture(sheet);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.repeat.set(1 / COLS - UV_PAD_X * 2, 1 / ROWS - UV_PAD_Y * 2);
  setTextureAction(tex, 'idle');

  if (!isCharacterSheetReady(character)) {
    const unsub = subscribeCharacterSheetReady(character, () => {
      tex.needsUpdate = true;
      unsub();
    });
  }

  return tex;
}

export function setTextureAction(texture: THREE.Texture, action: SpriteAction): void {
  const idx = ACTION_INDEX[action] ?? 0;
  const col = idx % COLS;
  const row = Math.floor(idx / COLS); // 0 = top row, 1 = bottom row
  // In Three.js UV space (flipY=true), Y=0 is bottom row (row 1), Y=1 is top row (row 0)
  const offsetY = (ROWS - 1 - row) / ROWS + UV_PAD_Y;
  texture.offset.set(col / COLS + UV_PAD_X, offsetY);
}

export function getCharacterPortraitDataUrl(character: CharacterKey): string {
  const cached = portraitCache.get(character);
  if (cached) return cached;

  const sheet = getCharacterSpriteSheet(character);
  const portrait = document.createElement('canvas');
  portrait.width = 128;
  portrait.height = 128;
  const pctx = portrait.getContext('2d')!;
  // Crop upper chest & head from frame 4 (melambai: col=0, row=1 -> x=0, y=256)
  pctx.drawImage(sheet, 28, 258, 200, 176, 0, 2, 128, 124);
  const url = portrait.toDataURL('image/png');
  if (isCharacterSheetReady(character)) {
    portraitCache.set(character, url);
  }
  return url;
}
