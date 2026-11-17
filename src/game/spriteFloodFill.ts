/**
 * Border flood-fill transparency algorithm for 4x2 sprite sheets.
 * Starts from all 4 outer borders of each sprite cell (or full sheet)
 * and clears contiguous background pixels matching the corner chroma key,
 * preserving interior details even if they share bright colors.
 * Also handles pre-alpha sticker sheets (like translucent outer halos).
 */
export function floodFillBorderRgba(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  tolerance = 36,
): Uint8ClampedArray {
  if (width <= 0 || height <= 0 || data.length < width * height * 4) {
    return data;
  }

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  // Sample top-left pixel as reference background color
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];
  const bgA = data[3];

  // If corner already has low alpha (e.g. PNG with soft sticker halo), strip border-connected translucent halo
  const isAlreadyAlpha = bgA < 120;
  const bgSpread = Math.max(bgR, bgG, bgB) - Math.min(bgR, bgG, bgB);
  const bgIsNeutral = bgSpread <= 12;

  const matchesBg = (idx4: number): boolean => {
    const a = data[idx4 + 3];
    if (a < 10) return true;
    if (isAlreadyAlpha) {
      // Clear outer translucent sticker halo while keeping solid character pixels
      return a < 140;
    }
    const r = data[idx4];
    const g = data[idx4 + 1];
    const b = data[idx4 + 2];
    if (bgIsNeutral) {
      const spread = Math.max(r, g, b) - Math.min(r, g, b);
      if (spread > 8) return false;
    }
    const dr = Math.abs(r - bgR);
    const dg = Math.abs(g - bgG);
    const db = Math.abs(b - bgB);
    return dr + dg + db <= tolerance * 3;
  };

  const enqueue = (x: number, y: number) => {
    const p = y * width + x;
    if (visited[p]) return;
    const idx4 = p * 4;
    if (matchesBg(idx4)) {
      visited[p] = 1;
      queue[tail++] = p;
    }
  };

  for (let x = 0; x < width; x++) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (head < tail) {
    const p = queue[head++];
    data[p * 4 + 3] = 0;

    const x = p % width;
    const y = (p - x) / width;

    if (x > 0) enqueue(x - 1, y);
    if (x < width - 1) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y < height - 1) enqueue(x, y + 1);
  }

  // Soften 1px fringe adjacent to cleared background (and drop faint alpha residue on transparent PNGs)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      const idx4 = p * 4;
      const a = data[idx4 + 3];
      if (a > 0) {
        if (isAlreadyAlpha && a < 90) {
          data[idx4 + 3] = 0;
          continue;
        }
        const adjCleared =
          visited[p - 1] || visited[p + 1] || visited[p - width] || visited[p + width];
        if (adjCleared && !isAlreadyAlpha) {
          const dist =
            (Math.abs(data[idx4] - bgR) +
              Math.abs(data[idx4 + 1] - bgG) +
              Math.abs(data[idx4 + 2] - bgB)) /
            3;
          if (dist < tolerance * 1.45) {
            data[idx4 + 3] = Math.round(a * 0.45);
          }
        }
      }
    }
  }

  return data;
}
