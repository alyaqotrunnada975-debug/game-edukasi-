import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { FloorTheme } from '../types/game';

export function detectSoftwareGl(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

export function createConfiguredRenderer(
  container: HTMLElement,
  isSoftwareGl: boolean,
): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: isSoftwareGl,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(container.clientWidth || 1280, container.clientHeight || 720);
  container.appendChild(renderer.domElement);
  return renderer;
}

export function setupStudioEnvironment(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  pmrem.dispose();
  return envTex;
}

let sharedToonGradient: THREE.DataTexture | null = null;
let sharedOutlineMat: THREE.MeshBasicMaterial | null = null;

/**
 * 4-band crisp cel-shading gradient texture shared across all 3D Cartoon materials.
 */
export function getToonGradientMap(): THREE.DataTexture {
  if (sharedToonGradient) return sharedToonGradient;
  const bands = new Uint8Array([102, 168, 224, 255]);
  const tex = new THREE.DataTexture(bands, bands.length, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  sharedToonGradient = tex;
  return tex;
}

export function getCartoonOutlineMaterial(): THREE.MeshBasicMaterial {
  if (sharedOutlineMat) return sharedOutlineMat;
  sharedOutlineMat = new THREE.MeshBasicMaterial({
    color: 0x261c15,
    side: THREE.BackSide,
  });
  return sharedOutlineMat;
}

export function createCartoonMaterial(
  color: number | string,
  options?: {
    emissive?: number;
    emissiveIntensity?: number;
    map?: THREE.Texture;
    transparent?: boolean;
    opacity?: number;
  },
): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: getToonGradientMap(),
    emissive: options?.emissive !== undefined ? new THREE.Color(options.emissive) : new THREE.Color(0x000000),
    emissiveIntensity: options?.emissiveIntensity ?? 1,
    map: options?.map ?? null,
    transparent: options?.transparent ?? false,
    opacity: options?.opacity ?? 1,
  });
}

/**
 * Adds a lightweight uniform-thickness 3D Cartoon dark ink outline around a mesh
 * without allocating extra geometries.
 */
export function addCartoonOutline(mesh: THREE.Mesh, thickness = 0.028): void {
  if (!mesh.geometry || mesh.userData.hasOutline || mesh.userData.skipOutline) return;
  mesh.userData.hasOutline = true;
  if (!mesh.geometry.boundingBox) {
    mesh.geometry.computeBoundingBox();
  }
  const bb = mesh.geometry.boundingBox;
  if (!bb) return;
  const hx = Math.max(0.07, (bb.max.x - bb.min.x) * 0.5 * Math.abs(mesh.scale.x || 1));
  const hy = Math.max(0.07, (bb.max.y - bb.min.y) * 0.5 * Math.abs(mesh.scale.y || 1));
  const hz = Math.max(0.07, (bb.max.z - bb.min.z) * 0.5 * Math.abs(mesh.scale.z || 1));

  const outline = new THREE.Mesh(mesh.geometry, getCartoonOutlineMaterial());
  outline.scale.set(1 + thickness / hx, 1 + thickness / hy, 1 + thickness / hz);
  outline.castShadow = false;
  outline.receiveShadow = false;
  outline.userData.skipOutline = true;
  mesh.add(outline);
}

export function scheduleAfterDraw(
  renderer: THREE.WebGLRenderer,
  cb: () => void,
  registerTimer: (id: number) => void,
): void {
  const gl = renderer.getContext() as WebGL2RenderingContext;
  if (gl && typeof gl.fenceSync === 'function') {
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
      if (state === gl.UNSIGNALED) {
        registerTimer(window.setTimeout(poll, 5));
      } else {
        if (sync) gl.deleteSync(sync);
        registerTimer(window.setTimeout(cb, 80));
      }
    };
    registerTimer(window.setTimeout(poll, 5));
  } else {
    registerTimer(window.setTimeout(cb, 80));
  }
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
  grad.addColorStop(0, 'rgba(18, 14, 10, 0.58)');
  grad.addColorStop(0.6, 'rgba(18, 14, 10, 0.25)');
  grad.addColorStop(1, 'rgba(18, 14, 10, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createFloorTexture(
  theme: FloorTheme,
  maxAnisotropy = 4,
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bctx = bumpCanvas.getContext('2d')!;

  if (theme === 'stone-courtyard') {
    // Location 1: Benteng Kuto Besak — sunlit tropical earth path & natural mossy flagstones
    ctx.fillStyle = '#cf9e68';
    ctx.fillRect(0, 0, size, size);
    bctx.fillStyle = '#686868';
    bctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 240; i++) {
      const rx = (i * 97) % size;
      const ry = (i * 151) % size;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(182, 134, 78, 0.35)' : 'rgba(228, 186, 130, 0.28)';
      ctx.fillRect(rx, ry, 14, 8);
    }
    const step = 64;
    for (let y = 0; y < size; y += step) {
      const offset = (y / step) % 2 === 0 ? 0 : step / 2;
      for (let x = -step; x < size + step; x += step) {
        const shade = 152 + ((x * 7 + y * 13) % 24);
        ctx.fillStyle = `rgb(${shade + 8}, ${shade}, ${shade - 16})`;
        ctx.beginPath();
        ctx.roundRect(x + offset + 5, y + 5, step - 10, step - 10, 10);
        ctx.fill();
        bctx.fillStyle = `rgb(${185 + ((x + y) % 35)}, ${185 + ((x + y) % 35)}, ${185 + ((x + y) % 35)})`;
        bctx.beginPath();
        bctx.roundRect(x + offset + 5, y + 5, step - 10, step - 10, 10);
        bctx.fill();
      }
    }
  } else if (theme === 'heritage-terracotta') {
    // Location 2: Museum SMB II — warm sunlit beige sandstone pavers matching Courtyard-6
    ctx.fillStyle = '#c8b397';
    ctx.fillRect(0, 0, size, size);
    bctx.fillStyle = '#585858';
    bctx.fillRect(0, 0, size, size);
    const step = 64;
    for (let y = 0; y < size; y += step) {
      const offset = (y / step) % 2 === 0 ? 0 : step / 2;
      for (let x = -step; x < size + step; x += step) {
        const warm = ((x / step + y / step) % 2 === 0) ? '#e1cfb5' : '#d6c1a4';
        ctx.fillStyle = warm;
        ctx.fillRect(x + offset + 2, y + 2, step - 4, step - 4);
        ctx.strokeStyle = 'rgba(170, 138, 102, 0.35)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + offset + 6, y + 6, step - 12, step - 12);
        bctx.fillStyle = '#cfcfcf';
        bctx.fillRect(x + offset + 2, y + 2, step - 4, step - 4);
      }
    }
  } else if (theme === 'musi-boardwalk') {
    // Location 3: Jembatan Ampera — warm pink-sandstone riverfront promenade pavers matching Riverfront-2
    ctx.fillStyle = '#b48772';
    ctx.fillRect(0, 0, size, size);
    bctx.fillStyle = '#555555';
    bctx.fillRect(0, 0, size, size);
    const step = 64;
    for (let y = 0; y < size; y += step) {
      const offset = (y / step) % 2 === 0 ? 0 : step / 2;
      for (let x = -step; x < size + step; x += step) {
        const tone = ((x * 3 + y * 5) % 3 === 0) ? '#dda98f' : '#cf9980';
        ctx.fillStyle = tone;
        ctx.fillRect(x + offset + 2, y + 2, step - 4, step - 4);
        bctx.fillStyle = '#d0d0d0';
        bctx.fillRect(x + offset + 2, y + 2, step - 4, step - 4);
      }
    }
  } else if (theme === 'swamp-lotus') {
    // Location 4: Pulau Kemaro — sunlit warm golden-oak wetland boardwalk planks matching Wetland-5
    ctx.fillStyle = '#5c3b22';
    ctx.fillRect(0, 0, size, size);
    bctx.fillStyle = '#404040';
    bctx.fillRect(0, 0, size, size);
    const plankH = 42;
    for (let y = 0; y < size; y += plankH) {
      ctx.fillStyle = (y / plankH) % 2 === 0 ? '#be8250' : '#ad7244';
      ctx.fillRect(0, y + 2, size, plankH - 4);
      ctx.fillStyle = 'rgba(255, 232, 195, 0.14)';
      ctx.fillRect(0, y + 6, size, 8);
      bctx.fillStyle = '#c8c8c8';
      bctx.fillRect(0, y + 2, size, plankH - 4);
      ctx.fillStyle = '#3a2414';
      ctx.beginPath();
      ctx.arc(24, y + plankH / 2, 3, 0, Math.PI * 2);
      ctx.arc(size - 24, y + plankH / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme === 'village-garden') {
    // Location 5: Rumah Limas — vibrant green village garden grass & sunlit earth path matching Village-3
    ctx.fillStyle = '#62a238';
    ctx.fillRect(0, 0, size, size);
    bctx.fillStyle = '#888888';
    bctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 380; i++) {
      const gx = (i * 73) % size;
      const gy = (i * 137) % size;
      ctx.fillStyle = i % 2 === 0 ? '#74b644' : '#4e8a2c';
      ctx.fillRect(gx, gy, 8, 12);
    }
    ctx.fillStyle = '#d6a066';
    for (let y = 16; y < size; y += 64) {
      ctx.beginPath();
      ctx.ellipse(size / 2 + ((y % 128) - 64) * 0.25, y + 18, 48, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      bctx.fillStyle = '#dcdcdc';
      ctx.beginPath();
      ctx.ellipse(size / 2 + ((y % 128) - 64) * 0.25, y + 18, 48, 26, 0, 0, Math.PI * 2);
      bctx.fill();
    }
  } else {
    // Location 6: Taman Purbakala — sunlit sandy path with mossy flagstones & weathered terracotta bricks
    ctx.fillStyle = '#c49664';
    ctx.fillRect(0, 0, size, size);
    bctx.fillStyle = '#7a7a7a';
    bctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 200; i++) {
      const gx = (i * 89) % size;
      const gy = (i * 149) % size;
      ctx.fillStyle = 'rgba(104, 146, 68, 0.36)';
      ctx.fillRect(gx, gy, 16, 12);
    }
    const step = 64;
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        const isStone = ((x + y) / step) % 2 === 0;
        if (isStone) {
          ctx.fillStyle = ((x / step) % 3 === 0) ? '#b86842' : '#9c988c';
          ctx.beginPath();
          ctx.roundRect(x + 6, y + 6, step - 12, step - 12, 8);
          ctx.fill();
          bctx.fillStyle = '#d4d4d4';
          bctx.beginPath();
          bctx.roundRect(x + 6, y + 6, step - 12, step - 12, 8);
          bctx.fill();
        }
      }
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(8, 8);
  map.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(8, 8);
  bumpMap.anisotropy = maxAnisotropy;

  return { map, bumpMap };
}

const panoramaCanvasCache = new Map<string, HTMLCanvasElement>();
const panoramaLoading = new Set<string>();

function buildSeamlessPanoramaCanvas(
  img: HTMLImageElement,
): HTMLCanvasElement {
  // Exact 16:9 seamless tile so wrapping 4x around the horizon cylinder preserves true image proportions
  const tileW = 1024;
  const tileH = 576;
  const blendW = 72;

  const canvas = document.createElement('canvas');
  canvas.width = tileW;
  canvas.height = tileH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, tileW, tileH);

  const edgeData = ctx.getImageData(0, 0, blendW, tileH);
  const rightData = ctx.getImageData(tileW - blendW, 0, blendW, tileH);
  for (let y = 0; y < tileH; y++) {
    for (let x = 0; x < blendW; x++) {
      const t = x / blendW;
      const idx = (y * blendW + x) * 4;
      edgeData.data[idx] = Math.round(rightData.data[idx] * (1 - t) + edgeData.data[idx] * t);
      edgeData.data[idx + 1] = Math.round(rightData.data[idx + 1] * (1 - t) + edgeData.data[idx + 1] * t);
      edgeData.data[idx + 2] = Math.round(rightData.data[idx + 2] * (1 - t) + edgeData.data[idx + 2] * t);
    }
  }
  ctx.putImageData(edgeData, 0, 0);
  return canvas;
}

export function preloadPanoramaBackdrop(imageUrl: string): void {
  if (typeof Image === 'undefined') return;
  if (panoramaCanvasCache.has(imageUrl) || panoramaLoading.has(imageUrl)) return;
  panoramaLoading.add(imageUrl);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    panoramaCanvasCache.set(imageUrl, buildSeamlessPanoramaCanvas(img));
  };
  img.src = imageUrl;
}

// Preload all 6 location panoramas lazily so exploration scenes paint immediately
if (typeof window !== 'undefined') {
  [
    '/assets/aistudio/Vibrant_Jungle_Pathway_and_Waterfall-1_d59797cf.png',
    '/assets/aistudio/Palembang_Heritage_House_Courtyard-6_815b8035.png',
    '/assets/aistudio/Vibrant_Musi_Riverfront_and_Ampera_Bridge-2_08919466.png',
    '/assets/aistudio/South_Sumatran_Wetland_Boardwalk-5_40fbae4a.png',
    '/assets/aistudio/Vibrant_Sumatra_Village_Garden_Scene-3_498fa8d8.png',
    '/assets/aistudio/Jungle_Temple_Ruins_Adventure-4_e5999158.png',
  ].forEach((url) => preloadPanoramaBackdrop(url));
}

/**
 * Builds a seamless 360-degree panoramic backdrop texture from a 16:9 illustration
 * repeated 4x around a proportioned cylinder so artwork preserves true 16:9 aspect ratio (zero squishing).
 */
export function createSeamlessPanoramaMesh(
  imageUrl: string,
  skyTopColor: string,
  skyBottomColor: string,
  radius = 40,
  height?: number,
): { mesh: THREE.Mesh; dispose: () => void } {
  const tilesAround = 4;
  const tileArcW = (2 * Math.PI * radius) / tilesAround;
  const naturalHeight = height ?? (tileArcW * 9) / 16;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 576;
  const ctx = canvas.getContext('2d')!;

  const cached = panoramaCanvasCache.get(imageUrl);
  if (cached) {
    ctx.drawImage(cached, 0, 0);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, skyTopColor);
    grad.addColorStop(0.62, skyBottomColor);
    grad.addColorStop(1, '#586d4c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(tilesAround, 1);

  if (!cached) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const built = buildSeamlessPanoramaCanvas(img);
      panoramaCanvasCache.set(imageUrl, built);
      ctx.drawImage(built, 0, 0);
      texture.needsUpdate = true;
    };
    img.src = imageUrl;
  }

  const geo = new THREE.CylinderGeometry(radius, radius, naturalHeight, 64, 1, true);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    fog: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.y = Math.PI * 0.5;
  mesh.position.y = naturalHeight * 0.24;

  return {
    mesh,
    dispose: () => {
      geo.dispose();
      mat.dispose();
      texture.dispose();
    },
  };
}
