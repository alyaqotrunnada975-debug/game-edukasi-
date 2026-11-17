import * as THREE from 'three';
import { LocationId, RelicItem } from '../types/game';
import { addCartoonOutline, createCartoonMaterial } from './glHelpers';

function outlineSolidChildren(root: THREE.Object3D, thickness = 0.028): void {
  const targets: THREE.Mesh[] = [];
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    if (obj.userData.skipOutline) return;
    const mat = obj.material as THREE.Material;
    if (mat && 'transparent' in mat && mat.transparent) return;
    if (
      obj.geometry instanceof THREE.RingGeometry ||
      obj.geometry instanceof THREE.CircleGeometry ||
      obj.geometry instanceof THREE.PlaneGeometry
    ) {
      return;
    }
    targets.push(obj);
  });
  for (const m of targets) {
    m.castShadow = true;
    m.receiveShadow = true;
    addCartoonOutline(m, thickness);
  }
}

/**
 * Stylized 3D Cartoon tropical coconut palm tree grounded at y=0.
 */
export function createPalmTreeGroup(scale = 1): THREE.Group {
  const group = new THREE.Group();

  const trunkMat = createCartoonMaterial(0x9a6439);
  const frondMat = createCartoonMaterial(0x47b549);
  const frondTipMat = createCartoonMaterial(0x6bd448);
  const coconutMat = createCartoonMaterial(0x693e22);

  for (let i = 0; i < 3; i++) {
    const segGeo = new THREE.CylinderGeometry(0.19 - i * 0.03, 0.24 - i * 0.03, 1.35, 10);
    const seg = new THREE.Mesh(segGeo, trunkMat);
    seg.position.set(i * 0.14, 0.65 + i * 1.25, 0);
    seg.rotation.z = -0.06 * (i + 1);
    group.add(seg);
  }

  const topPos = new THREE.Vector3(0.36, 3.85, 0);

  for (let c = 0; c < 3; c++) {
    const nut = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), coconutMat);
    const a = (c / 3) * Math.PI * 2;
    nut.position.set(
      topPos.x + Math.cos(a) * 0.24,
      topPos.y - 0.14,
      topPos.z + Math.sin(a) * 0.24,
    );
    group.add(nut);
  }

  for (let f = 0; f < 7; f++) {
    const frondPivot = new THREE.Group();
    frondPivot.position.copy(topPos);
    frondPivot.rotation.y = (f / 7) * Math.PI * 2 + (f % 2) * 0.15;

    const innerBlade = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.16, 0.72, 4, 8),
      frondMat,
    );
    innerBlade.rotation.z = Math.PI * 0.42;
    innerBlade.scale.set(0.45, 1, 1.35);
    innerBlade.position.set(0.55, 0.18, 0);

    const outerBlade = new THREE.Mesh(
      new THREE.ConeGeometry(0.24, 1.1, 6),
      frondTipMat,
    );
    outerBlade.scale.set(0.32, 1, 1.2);
    outerBlade.position.set(1.32, 0.02, 0);
    outerBlade.rotation.z = -Math.PI * 0.68;

    frondPivot.add(innerBlade, outerBlade);
    group.add(frondPivot);
  }

  outlineSolidChildren(group, 0.028);
  group.scale.setScalar(scale);
  return group;
}

/**
 * Floating 3D pin badge sprite for Map Diorama landmarks.
 */
export function createMapPinLabel(order: number, label: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 360;
  canvas.height = 84;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(24, 34, 36, 0.94)';
  ctx.beginPath();
  ctx.roundRect(6, 6, 348, 72, 18);
  ctx.fill();
  ctx.strokeStyle = '#f5b942';
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.fillStyle = '#f5b942';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${order}.`, 24, 52);

  ctx.fillStyle = '#faf5eb';
  ctx.font = 'bold 25px sans-serif';
  ctx.fillText(label, 62, 52);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(2.5, 0.58, 1);
  return sprite;
}

/**
 * 3D Cartoon Palembang heritage Info Board (Papan Informasi) grounded at y=0,
 * with ground beacon ring and emissive highlight materials stored on userData.
 */
export function createInfoBoardGroup(titleText: string): THREE.Group {
  const group = new THREE.Group();

  const woodMat = createCartoonMaterial(0x7d4c2a);
  const goldMat = createCartoonMaterial(0xf5b942);
  const roofMat = createCartoonMaterial(0xc8432d);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.24, 0.64),
    createCartoonMaterial(0xa4947f),
  );
  base.position.y = 0.12;
  group.add(base);

  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x2dd4bf,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.42,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.38, 32), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  ring.userData.skipOutline = true;
  group.add(ring);

  [-0.88, 0.88].forEach((x) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 2.2, 10), woodMat);
    post.position.set(x, 1.2, 0);
    group.add(post);
  });

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#F7EEDB';
  ctx.fillRect(0, 0, 512, 320);
  ctx.strokeStyle = '#9C6D24';
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, 492, 300);
  ctx.fillStyle = '#093D3E';
  ctx.fillRect(24, 24, 464, 68);
  ctx.fillStyle = '#FAF5EB';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAPAN INFORMASI', 256, 68);
  ctx.fillStyle = '#1E1510';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(titleText.slice(0, 28), 256, 155);
  ctx.fillStyle = '#8F291D';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('Tekan [E] atau Dekati', 256, 232);

  const plaqueTex = new THREE.CanvasTexture(canvas);
  plaqueTex.colorSpace = THREE.SRGBColorSpace;
  const boardMat = createCartoonMaterial(0xffffff, { map: plaqueTex });
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.78, 1.12, 0.14), boardMat);
  board.position.set(0, 1.48, 0);
  group.add(board);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.58, 0.58, 4), roofMat);
  roof.position.set(0, 2.44, 0);
  roof.rotation.y = Math.PI * 0.25;
  roof.scale.set(1.15, 1, 0.55);
  group.add(roof);

  const finial = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), goldMat);
  finial.position.set(0, 2.82, 0);
  group.add(finial);

  outlineSolidChildren(group, 0.025);

  group.userData = {
    ring,
    finial,
    highlightMats: [goldMat, boardMat],
  };

  return group;
}

let songketTextureCache: THREE.CanvasTexture | null = null;
let compassDialCache: THREE.CanvasTexture | null = null;
let inscriptionTextureCache: THREE.CanvasTexture | null = null;
let pitisTextureCache: THREE.CanvasTexture | null = null;
let lacquerTextureCache: THREE.CanvasTexture | null = null;
let woodGrainCache: THREE.CanvasTexture | null = null;

function getSongketTexture(): THREE.CanvasTexture {
  if (songketTextureCache) return songketTextureCache;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#a92222';
  ctx.fillRect(0, 0, 256, 256);

  // Woven gold Palembang Lepus diamond grid
  ctx.strokeStyle = '#f8c945';
  ctx.lineWidth = 4;
  for (let y = 0; y <= 256; y += 32) {
    for (let x = 0; x <= 256; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x + 16, y + 3);
      ctx.lineTo(x + 29, y + 16);
      ctx.lineTo(x + 16, y + 29);
      ctx.lineTo(x + 3, y + 16);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(x + 16, y + 16, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Ornate golden tumpal borders
  ctx.fillStyle = '#f5b942';
  ctx.fillRect(0, 0, 256, 18);
  ctx.fillRect(0, 238, 256, 18);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  songketTextureCache = tex;
  return tex;
}

function getCompassDialTexture(): THREE.CanvasTexture {
  if (compassDialCache) return compassDialCache;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fbf4e2';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#261c15';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(128, 128, 114, 0, Math.PI * 2);
  ctx.stroke();

  // Compass ticks
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r1 = i % 4 === 0 ? 86 : 98;
    ctx.beginPath();
    ctx.moveTo(128 + Math.cos(a) * r1, 128 + Math.sin(a) * r1);
    ctx.lineTo(128 + Math.cos(a) * 110, 128 + Math.sin(a) * 110);
    ctx.stroke();
  }

  ctx.fillStyle = '#b93829';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('U', 128, 52);
  ctx.fillStyle = '#0e5a5c';
  ctx.fillText('S', 128, 204);
  ctx.fillText('T', 202, 128);
  ctx.fillText('B', 54, 128);

  // Red/Teal needle
  ctx.fillStyle = '#d93829';
  ctx.beginPath();
  ctx.moveTo(128, 72);
  ctx.lineTo(142, 128);
  ctx.lineTo(114, 128);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0e5a5c';
  ctx.beginPath();
  ctx.moveTo(128, 184);
  ctx.lineTo(142, 128);
  ctx.lineTo(114, 128);
  ctx.closePath();
  ctx.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  compassDialCache = tex;
  return tex;
}

function getInscriptionTexture(): THREE.CanvasTexture {
  if (inscriptionTextureCache) return inscriptionTextureCache;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#979188';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#d6c278';
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, 220, 220);

  // Stylized Pallawa stone engraving rows
  ctx.strokeStyle = '#efe2b0';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (let row = 0; row < 6; row++) {
    const y = 52 + row * 28;
    for (let x = 36; x < 216; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10, y + (row % 2 === 0 ? -6 : 6));
      ctx.lineTo(x + 15, y);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  inscriptionTextureCache = tex;
  return tex;
}

function getPitisCoinTexture(): THREE.CanvasTexture {
  if (pitisTextureCache) return pitisTextureCache;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#d9a438';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#9b6b18';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(128, 128, 112, 0, Math.PI * 2);
  ctx.stroke();

  // Embossed Jawi-inspired marks around center square
  ctx.fillStyle = '#fef08a';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(128 + Math.cos(a) * 82, 128 + Math.sin(a) * 82, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  // Authentic Koin Pitis center square hole
  ctx.fillStyle = '#261c15';
  ctx.fillRect(96, 96, 64, 64);
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 6;
  ctx.strokeRect(96, 96, 64, 64);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  pitisTextureCache = tex;
  return tex;
}

function getLacquerTexture(): THREE.CanvasTexture {
  if (lacquerTextureCache) return lacquerTextureCache;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#a82420';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#f5c242';
  ctx.lineWidth = 12;
  ctx.strokeRect(14, 14, 228, 228);

  // Golden lotus flower carving
  ctx.fillStyle = '#f8cb46';
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.translate(128, 128);
    ctx.rotate((i / 8) * Math.PI * 2);
    ctx.beginPath();
    ctx.ellipse(0, -48, 16, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#b93829';
  ctx.beginPath();
  ctx.arc(128, 128, 22, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  lacquerTextureCache = tex;
  return tex;
}

function getWoodGrainTexture(): THREE.CanvasTexture {
  if (woodGrainCache) return woodGrainCache;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#733e20';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#4e2712';
  ctx.lineWidth = 5;
  for (let r = 18; r <= 120; r += 16) {
    ctx.beginPath();
    ctx.arc(128, 128, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  woodGrainCache = tex;
  return tex;
}

/**
 * 3D Cartoon Collectible Relic on pedestal with beacon ring, proximity halo,
 * and bespoke recognizable 3D shape for every single artifact.
 */
export function createRelicGroup(relic: RelicItem): {
  group: THREE.Group;
  artifact: THREE.Group;
  ring: THREE.Mesh;
  aura: THREE.Mesh;
  highlightMats: THREE.MeshToonMaterial[];
} {
  const group = new THREE.Group();
  const artifact = new THREE.Group();

  const stoneMat = createCartoonMaterial(0xa59784);
  const paleStoneMat = createCartoonMaterial(0xede4d3);
  const goldMat = createCartoonMaterial(0xf8bf35);
  const woodMat = createCartoonMaterial(0x8c552e);
  const crimsonMat = createCartoonMaterial(0xde4435);
  const jadeMat = createCartoonMaterial(0x1f928b);
  const ironMat = createCartoonMaterial(0x6b7580);
  const terracottaMat = createCartoonMaterial(0xd1653c);
  const highlightMats: THREE.MeshToonMaterial[] = [goldMat, crimsonMat, jadeMat];

  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.6, 0.34, 12), stoneMat);
  ped.position.y = 0.17;
  group.add(ped);

  const ringGeo = new THREE.RingGeometry(0.56, 0.74, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xf5b942,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.72,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  ring.userData.skipOutline = true;
  group.add(ring);

  const aura = new THREE.Mesh(
    new THREE.TorusGeometry(0.58, 0.034, 8, 24),
    new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.0,
    }),
  );
  aura.position.y = 1.08;
  aura.userData.skipOutline = true;
  group.add(aura);

  switch (relic.iconType) {
    case 'cannon': {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.17, 0.92, 12), goldMat);
      barrel.rotation.z = Math.PI * 0.36;
      barrel.position.y = 0.14;
      const muzzle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.032, 8, 14), goldMat);
      muzzle.rotation.y = Math.PI / 2;
      muzzle.rotation.x = Math.PI * 0.14;
      muzzle.position.set(-0.39, 0.33, 0);
      const carriage = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.2, 0.36), woodMat);
      const wheel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.07, 12), woodMat);
      wheel1.rotation.x = Math.PI / 2;
      wheel1.position.set(0, -0.05, 0.21);
      const wheel2 = wheel1.clone();
      wheel2.position.z = -0.21;
      artifact.add(barrel, muzzle, carriage, wheel1, wheel2);
      break;
    }

    case 'key': {
      const bow = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.058, 10, 18), ironMat);
      bow.position.set(-0.32, 0, 0);
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 10), goldMat);
      collar.rotation.z = Math.PI / 2;
      collar.position.set(-0.08, 0, 0);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.62, 10), ironMat);
      shaft.rotation.z = Math.PI / 2;
      shaft.position.set(0.2, 0, 0);
      const bit1 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.22, 0.05), ironMat);
      bit1.position.set(0.32, -0.11, 0);
      const bit2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.05), goldMat);
      bit2.position.set(0.45, -0.08, 0);
      artifact.rotation.z = 0.28;
      highlightMats.push(ironMat);
      artifact.add(bow, collar, shaft, bit1, bit2);
      break;
    }

    case 'stone': {
      const tray = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.08, 0.56), woodMat);
      tray.position.y = -0.26;
      const chunkMain = new THREE.Mesh(new THREE.DodecahedronGeometry(0.33, 0), paleStoneMat);
      chunkMain.scale.set(1.25, 0.9, 1.0);
      chunkMain.position.set(-0.04, 0.04, 0);
      const chunkSide = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), paleStoneMat);
      chunkSide.position.set(0.24, -0.08, 0.14);
      const mossBit = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 8, 8),
        createCartoonMaterial(0x72be46),
      );
      mossBit.position.set(-0.18, 0.24, 0.14);
      highlightMats.push(paleStoneMat);
      artifact.add(tray, chunkMain, chunkSide, mossBit);
      break;
    }

    case 'songket': {
      // Draped crimson-and-gold Palembang Songket fabric roll & woven banner on display rack
      const songketMat = createCartoonMaterial(0xffffff, { map: getSongketTexture() });
      const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.08, 0.28), woodMat);
      standBase.position.y = -0.34;
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.78, 10), goldMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.y = 0.34;
      const clothFront = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.62, 0.1), songketMat);
      clothFront.position.set(0, 0.02, 0.03);
      clothFront.rotation.x = -0.14;
      const clothFold = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.68, 12), songketMat);
      clothFold.rotation.z = Math.PI / 2;
      clothFold.position.set(0, 0.32, 0);
      const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.09, 0.08), goldMat);
      fringe.position.set(0, -0.28, 0.08);
      highlightMats.push(songketMat);
      artifact.add(standBase, bar, clothFront, clothFold, fringe);
      break;
    }

    case 'statue': {
      // Sculpted Sriwijaya sandstone Arca on tiered lotus pedestal with golden halo & tiered crown
      const statueStoneMat = createCartoonMaterial(0xbcb09b);
      const lotusBase = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.14, 14), stoneMat);
      lotusBase.position.y = -0.34;
      const lotusRim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 8, 16), goldMat);
      lotusRim.rotation.x = Math.PI / 2;
      lotusRim.position.y = -0.26;
      const lowerRobe = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.24, 12), statueStoneMat);
      lowerRobe.position.y = -0.14;
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.3, 0.22), statueStoneMat);
      torso.position.y = 0.08;
      const necklace = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 8, 16), goldMat);
      necklace.rotation.x = Math.PI / 2 - 0.35;
      necklace.position.set(0, 0.18, 0.06);
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.028, 8, 20), goldMat);
      halo.position.set(0, 0.38, -0.09);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), statueStoneMat);
      head.position.set(0, 0.35, 0.01);
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 0.05), ironMat);
      brow.position.set(0, 0.38, 0.14);
      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 8), goldMat);
      crown.position.set(0, 0.54, 0.01);
      [-0.25, 0.25].forEach((ax) => {
        const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.2, 4, 8), statueStoneMat);
        arm.position.set(ax, 0.06, 0.05);
        arm.rotation.z = ax < 0 ? 0.32 : -0.32;
        const armband = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.018, 6, 12), goldMat);
        armband.rotation.x = Math.PI / 2;
        armband.position.set(ax, 0.12, 0.05);
        artifact.add(arm, armband);
      });
      highlightMats.push(statueStoneMat);
      artifact.add(lotusBase, lotusRim, lowerRobe, torso, necklace, halo, head, brow, crown);
      break;
    }

    case 'coin': {
      // Oversized Palembang Koin Pitis (antique bronze coin with authentic square center hole)
      const pitisMat = createCartoonMaterial(0xffffff, { map: getPitisCoinTexture() });
      const rimMat = createCartoonMaterial(0xe3b13b);
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.09, 24), [
        rimMat,
        pitisMat,
        pitisMat,
      ]);
      disc.rotation.x = Math.PI / 2;
      disc.position.y = 0.04;
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.24), woodMat);
      stand.position.y = -0.34;
      highlightMats.push(rimMat);
      artifact.add(disc, stand);
      break;
    }

    case 'compass': {
      const dialMat = createCartoonMaterial(0xffffff, { map: getCompassDialTexture() });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.12, 20), [
        goldMat,
        dialMat,
        goldMat,
      ]);
      body.rotation.x = Math.PI * 0.36;
      const topLoop = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 8, 14), goldMat);
      topLoop.position.set(0, 0.38, -0.14);
      artifact.add(body, topLoop);
      break;
    }

    case 'boat': {
      const hull = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.18, 0.3), woodMat);
      const bow = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 4), woodMat);
      bow.rotation.z = -Math.PI / 2;
      bow.rotation.x = Math.PI / 4;
      bow.position.set(0.54, 0.04, 0);
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.22, 0.24), jadeMat);
      cabin.position.set(-0.04, 0.17, 0);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.3), goldMat);
      roof.position.set(-0.04, 0.3, 0);
      artifact.add(hull, bow, cabin, roof);
      break;
    }

    case 'badge': {
      // Commemorative Ampera Twin-Tower Gold Medallion
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.06), jadeMat);
      ribbon.position.y = 0.28;
      const medal = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.09, 20), goldMat);
      medal.rotation.x = Math.PI / 2;
      medal.position.y = -0.04;
      [-0.1, 0.1].forEach((tx) => {
        const tower = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.26, 0.12), crimsonMat);
        tower.position.set(tx, -0.02, 0.02);
        artifact.add(tower);
      });
      const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.05, 0.13), crimsonMat);
      bridgeDeck.position.set(0, -0.09, 0.02);
      artifact.add(ribbon, medal, bridgeDeck);
      break;
    }

    case 'jar': {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 12), jadeMat);
      body.scale.set(1, 1.25, 1);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.16, 12), jadeMat);
      neck.position.y = 0.35;
      const capTop = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.15, 12), goldMat);
      capTop.position.y = 0.49;
      const belt = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.032, 8, 20), goldMat);
      belt.rotation.x = Math.PI / 2;
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.1, 12), goldMat);
      foot.position.y = -0.36;
      artifact.add(body, neck, capTop, belt, foot);
      break;
    }

    case 'lantern': {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.31, 14, 12), crimsonMat);
      body.scale.set(1.06, 1.18, 1.06);
      const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.11, 12), goldMat);
      capTop.position.y = 0.35;
      const capBot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.11, 12), goldMat);
      capBot.position.y = -0.35;
      const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.28, 8), crimsonMat);
      tassel.rotation.x = Math.PI;
      tassel.position.y = -0.52;
      artifact.add(body, capTop, capBot, tassel);
      break;
    }

    case 'tablet': {
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.12, 0.32), stoneMat);
      base.position.y = -0.32;
      const stele = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.56, 0.16), paleStoneMat);
      stele.position.y = 0.02;
      const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.16, 16), paleStoneMat);
      arch.rotation.x = Math.PI / 2;
      arch.position.y = 0.3;
      const heartEmblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), crimsonMat);
      heartEmblem.position.set(0, 0.12, 0.09);
      highlightMats.push(paleStoneMat);
      artifact.add(base, stele, arch, heartEmblem);
      break;
    }

    case 'lacquer': {
      const lacquerMat = createCartoonMaterial(0xffffff, { map: getLacquerTexture() });
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.68, 0.1), [
        goldMat,
        goldMat,
        goldMat,
        goldMat,
        lacquerMat,
        lacquerMat,
      ]);
      const easel = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.09, 0.26), woodMat);
      easel.position.y = -0.36;
      highlightMats.push(lacquerMat);
      artifact.add(panel, easel);
      break;
    }

    case 'wood': {
      const grainMat = createCartoonMaterial(0xffffff, { map: getWoodGrainTexture() });
      const timber = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.72, 10), [
        woodMat,
        grainMat,
        grainMat,
      ]);
      timber.rotation.z = Math.PI * 0.38;
      const brassTag = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.05), goldMat);
      brassTag.position.set(0.05, 0.24, 0.22);
      highlightMats.push(woodMat);
      artifact.add(timber, brassTag);
      break;
    }

    case 'spire': {
      // Rumah Limas Simbar curved golden crest ornament
      const ridgeBase = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.14, 0.24), woodMat);
      ridgeBase.position.y = -0.26;
      const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.52, 8), goldMat);
      hornL.position.set(-0.18, 0.06, 0);
      hornL.rotation.z = 0.42;
      const hornR = hornL.clone();
      hornR.position.x = 0.18;
      hornR.rotation.z = -0.42;
      const centerFlame = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.42, 8), crimsonMat);
      centerFlame.position.set(0, 0.08, 0);
      artifact.add(ridgeBase, hornL, hornR, centerFlame);
      break;
    }

    case 'inscription': {
      // Prasasti Kedukan Bukit stone slab with Pallawa script lines
      const scriptMat = createCartoonMaterial(0xffffff, { map: getInscriptionTexture() });
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.14, 0.36), stoneMat);
      base.position.y = -0.32;
      const slab = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.64, 0.18), [
        stoneMat,
        stoneMat,
        stoneMat,
        stoneMat,
        scriptMat,
        scriptMat,
      ]);
      slab.position.y = 0.04;
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.18, 12), stoneMat);
      cap.rotation.x = Math.PI / 2;
      cap.position.y = 0.36;
      highlightMats.push(stoneMat);
      artifact.add(base, slab, cap);
      break;
    }

    case 'brick': {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.28, 0.44), terracottaMat);
      slab.rotation.set(0.25, 0.3, -0.15);
      const stamp = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 12), goldMat);
      stamp.position.set(0, 0.16, 0);
      stamp.rotation.set(0.25, 0.3, -0.15);
      const mossCorner = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 8, 8),
        createCartoonMaterial(0x6ec043),
      );
      mossCorner.position.set(-0.24, 0.14, 0.12);
      highlightMats.push(terracottaMat);
      artifact.add(slab, stamp, mossCorner);
      break;
    }

    case 'ship': {
      // Three-masted Nusantara Jung sailing ship
      const hull = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.2, 0.34), woodMat);
      hull.position.y = -0.16;
      const stern = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.32), crimsonMat);
      stern.position.set(-0.34, 0.02, 0);
      const mastMain = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.035, 0.72, 8), goldMat);
      mastMain.position.set(0.05, 0.24, 0);
      const sailMain = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.44, 0.42), paleStoneMat);
      sailMain.position.set(0.08, 0.28, 0);
      sailMain.rotation.y = 0.35;
      const pennant = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.03), crimsonMat);
      pennant.position.set(-0.04, 0.56, 0);
      artifact.add(hull, stern, mastMain, sailMain, pennant);
      break;
    }

    default: {
      const _exhaustive: never = relic.iconType;
      void _exhaustive;
      break;
    }
  }

  artifact.position.y = 1.08;
  group.add(artifact);

  outlineSolidChildren(group, 0.022);

  return {
    group,
    artifact,
    ring,
    aura,
    highlightMats,
  };
}

/**
 * 3D Cartoon Perahu Ketek river boat for Map Diorama & Musi scene.
 */
export function createPerahuKetekGroup(): THREE.Group {
  const group = new THREE.Group();
  const hullMat = createCartoonMaterial(0x9a592b);
  const trimMat = createCartoonMaterial(0x16807c);
  const roofMat = createCartoonMaterial(0xf7be38);

  const hull = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.24, 0.44), hullMat);
  hull.position.y = 0.12;
  const bow = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.5, 4), hullMat);
  bow.rotation.z = -Math.PI / 2;
  bow.rotation.x = Math.PI / 4;
  bow.position.set(0.76, 0.15, 0);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.26, 0.36), trimMat);
  cabin.position.set(-0.05, 0.32, 0);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.44), roofMat);
  roof.position.set(-0.05, 0.48, 0);

  group.add(hull, bow, cabin, roof);
  outlineSolidChildren(group, 0.022);
  return group;
}

/**
 * 3D Cartoon Landmark Architecture matched to the 6 attached illustrations
 * with cel-shading and crisp ink outlines.
 */
export function createMapLandmarkMiniature(locationId: LocationId): THREE.Group {
  const group = new THREE.Group();
  const redMat = createCartoonMaterial(0xe34234);
  const roofRedMat = createCartoonMaterial(0xd45136);
  const goldMat = createCartoonMaterial(0xf7bd33);
  const stoneMat = createCartoonMaterial(0xdcd0bd);
  const darkStoneMat = createCartoonMaterial(0x9e9384);
  const woodMat = createCartoonMaterial(0x8e562d);
  const brickMat = createCartoonMaterial(0xdb7642);
  const tealMat = createCartoonMaterial(0x21a5a8);
  const mossMat = createCartoonMaterial(0x78be48);
  const steelMat = createCartoonMaterial(0xe2edf5);

  // Stepped stone foundation plinth
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.35, 0.24, 18), darkStoneMat);
  plinth.position.y = 0.12;
  group.add(plinth);

  if (locationId === 'benteng-kuto-besak') {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.64, 1.08), stoneMat);
    wall.position.y = 0.52;
    group.add(wall);

    for (let mx = -0.6; mx <= 0.6; mx += 0.3) {
      const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.15), stoneMat);
      merlon.position.set(mx, 0.92, 0.47);
      const merlonBack = merlon.clone();
      merlonBack.position.z = -0.47;
      group.add(merlon, merlonBack);
    }

    [-0.78, 0.78].forEach((bx) => {
      const bastion = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.33, 0.84, 10), brickMat);
      bastion.position.set(bx, 0.62, 0.48);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.29, 0.12, 10), stoneMat);
      cap.position.set(bx, 1.06, 0.48);
      const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.075, 0.4, 8), goldMat);
      cannon.rotation.x = Math.PI * 0.46;
      cannon.position.set(bx, 0.96, 0.72);
      group.add(bastion, cap, cannon);
    });

    const gateFrame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.52, 0.15), darkStoneMat);
    gateFrame.position.set(0, 0.48, 0.51);
    const gateDoor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.42, 0.17), woodMat);
    gateDoor.position.set(0, 0.44, 0.52);
    const crest = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), goldMat);
    crest.position.set(0, 0.79, 0.59);
    group.add(gateFrame, gateDoor, crest);

    const innerRoof = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.38, 4), roofRedMat);
    innerRoof.rotation.y = Math.PI / 4;
    innerRoof.position.set(0, 1.03, -0.1);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.68, 6), goldMat);
    pole.position.set(0, 1.25, -0.1);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.05), redMat);
    flag.position.set(0.18, 1.45, -0.1);
    group.add(innerRoof, pole, flag);
  } else if (locationId === 'museum-smb2') {
    const terrace = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.24, 1.08), stoneMat);
    terrace.position.y = 0.34;
    const steps = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.22, 0.36), stoneMat);
    steps.position.set(0, 0.28, 0.65);
    group.add(terrace, steps);

    const hall = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.54, 0.86), woodMat);
    hall.position.y = 0.7;
    const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.09, 0.9), goldMat);
    goldTrim.position.y = 0.94;
    const doorway = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.4, 0.08),
      createCartoonMaterial(0x362012),
    );
    doorway.position.set(0, 0.64, 0.43);
    group.add(hall, goldTrim, doorway);

    const porchRoof = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.28, 4), roofRedMat);
    porchRoof.rotation.y = Math.PI / 4;
    porchRoof.position.set(0, 1.09, 0.49);

    const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.46, 4), roofRedMat);
    lowerRoof.rotation.y = Math.PI / 4;
    lowerRoof.scale.set(1.22, 1, 0.92);
    lowerRoof.position.y = 1.19;

    const upperRoof = new THREE.Mesh(new THREE.ConeGeometry(0.78, 0.5, 4), roofRedMat);
    upperRoof.rotation.y = Math.PI / 4;
    upperRoof.scale.set(1.25, 1, 0.86);
    upperRoof.position.y = 1.49;

    const ridgeGold = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.07, 0.08), goldMat);
    ridgeGold.position.y = 1.74;
    group.add(porchRoof, lowerRoof, upperRoof, ridgeGold);
  } else if (locationId === 'jembatan-ampera') {
    const pierL = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.48), stoneMat);
    pierL.position.set(-0.55, 0.36, 0);
    const pierR = pierL.clone();
    pierR.position.x = 0.55;
    group.add(pierL, pierR);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.14, 0.44), redMat);
    deck.position.y = 0.56;
    group.add(deck);

    [-0.55, 0.55].forEach((tx) => {
      [-0.14, 0.14].forEach((tz) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.28, 0.13), redMat);
        leg.position.set(tx, 1.18, tz);
        group.add(leg);
      });
      const topBox = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.44), redMat);
      topBox.position.set(tx, 1.74, 0);
      const topCap = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.09, 0.5), roofRedMat);
      topCap.position.set(tx, 1.89, 0);
      const tealSign = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.11, 0.46), tealMat);
      tealSign.position.set(tx, 1.32, 0);
      const goldEmblem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.46, 12), goldMat);
      goldEmblem.rotation.x = Math.PI / 2;
      goldEmblem.position.set(tx, 1.54, 0);
      group.add(topBox, topCap, tealSign, goldEmblem);
    });

    [-1, 1].forEach((side) => {
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.95, 6), steelMat);
      cable.position.set(side * 0.85, 1.12, 0.15);
      cable.rotation.z = side * 0.62;
      cable.userData.skipOutline = true;
      const cableBack = cable.clone();
      cableBack.position.z = -0.15;
      cableBack.userData.skipOutline = true;
      group.add(cable, cableBack);
    });
  } else if (locationId === 'pulau-kemaro') {
    for (let t = 0; t < 5; t++) {
      const tier = new THREE.Mesh(
        new THREE.CylinderGeometry(0.47 - t * 0.065, 0.51 - t * 0.065, 0.26, 8),
        t % 2 === 0 ? redMat : stoneMat,
      );
      tier.position.y = 0.36 + t * 0.28;
      const eave = new THREE.Mesh(new THREE.ConeGeometry(0.64 - t * 0.08, 0.16, 8), goldMat);
      eave.position.y = 0.5 + t * 0.28;
      group.add(tier, eave);
    }
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.38, 8), goldMat);
    spire.position.y = 1.93;
    group.add(spire);
  } else if (locationId === 'rumah-limas') {
    [-0.5, 0.5].forEach((x) => {
      [-0.34, 0.34].forEach((z) => {
        const footing = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.17, 8), stoneMat);
        footing.position.set(x, 0.28, z);
        const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8), woodMat);
        stilt.position.set(x, 0.45, z);
        group.add(footing, stilt);
      });
    });

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.46, 0.9), woodMat);
    cabin.position.y = 0.76;
    const goldRail = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.13, 0.94), goldMat);
    goldRail.position.y = 0.64;
    const stairs = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.36), woodMat);
    stairs.position.set(0, 0.38, 0.56);
    stairs.rotation.x = -0.35;

    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.08, 0.62, 4), roofRedMat);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.22, 1, 0.88);
    roof.position.y = 1.24;

    const simbarL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 6), goldMat);
    simbarL.position.set(-0.22, 1.59, 0);
    simbarL.rotation.z = 0.35;
    const simbarR = simbarL.clone();
    simbarR.position.x = 0.22;
    simbarR.rotation.z = -0.35;
    group.add(cabin, goldRail, stairs, roof, simbarL, simbarR);
  } else {
    for (let s = 0; s < 4; s++) {
      const w = 1.5 - s * 0.26;
      const step = new THREE.Mesh(new THREE.BoxGeometry(w, 0.29, w * 0.92), brickMat);
      step.position.y = 0.34 + s * 0.27;
      group.add(step);
    }
    const sanctum = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.42, 0.15),
      createCartoonMaterial(0x362820),
    );
    sanctum.position.set(0, 0.82, 0.42);
    const stairs = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.35, 0.44), darkStoneMat);
    stairs.position.set(0, 0.38, 0.68);
    const mossCap = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.11, 0.72), mossMat);
    mossCap.position.y = 1.32;
    const lotusWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.09, 14), stoneMat);
    lotusWheel.rotation.x = Math.PI / 2;
    lotusWheel.rotation.z = 0.2;
    lotusWheel.position.set(0.88, 0.45, 0.45);
    group.add(sanctum, stairs, mossCap, lotusWheel);
  }

  outlineSolidChildren(group, 0.022);
  return group;
}

// --- 3D Cartoon Perimeter Props matched to the 6 Attached Illustrations ---

function createMossyBoulder(scale = 1): THREE.Group {
  const g = new THREE.Group();
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.6, 1),
    createCartoonMaterial(0x99958c),
  );
  rock.scale.set(1.25, 0.82, 1.05);
  rock.position.y = 0.38;
  const moss = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.5, 1),
    createCartoonMaterial(0x6ec043),
  );
  moss.scale.set(1.1, 0.38, 0.9);
  moss.position.y = 0.68;
  g.add(rock, moss);
  outlineSolidChildren(g, 0.026);
  g.scale.setScalar(scale);
  return g;
}

function createHibiscusBush(scale = 1): THREE.Group {
  const g = new THREE.Group();
  const bushMat = createCartoonMaterial(0x52ad38);
  const bushTopMat = createCartoonMaterial(0x74cd48);
  const flowerMat = createCartoonMaterial(0xf2423d);

  const base = new THREE.Mesh(new THREE.SphereGeometry(0.56, 12, 10), bushMat);
  base.scale.set(1.22, 0.78, 1.12);
  base.position.y = 0.35;
  const puff = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 8), bushTopMat);
  puff.position.set(0.18, 0.56, 0.05);
  g.add(base, puff);

  [
    [-0.25, 0.56, 0.38],
    [0.24, 0.68, 0.28],
    [0.02, 0.46, 0.5],
  ].forEach(([x, y, z]) => {
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), flowerMat);
    fl.position.set(x, y, z);
    g.add(fl);
  });
  outlineSolidChildren(g, 0.024);
  g.scale.setScalar(scale);
  return g;
}

function createGazeboPavilion(scale = 1): THREE.Group {
  const g = new THREE.Group();
  const woodMat = createCartoonMaterial(0x8e562d);
  const roofMat = createCartoonMaterial(0xd44b33);
  const goldMat = createCartoonMaterial(0xf7bd33);
  const stoneMat = createCartoonMaterial(0xd6c7ae);

  const floor = new THREE.Mesh(new THREE.BoxGeometry(2.64, 0.3, 2.24), stoneMat);
  floor.position.y = 0.15;
  g.add(floor);

  [-1.0, 1.0].forEach((px) => {
    [-0.85, 0.85].forEach((pz) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 1.9, 10), woodMat);
      post.position.set(px, 1.18, pz);
      g.add(post);
    });
  });

  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 0.98, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.15, 1, 0.95);
  roof.position.y = 2.55;
  const trim = new THREE.Mesh(new THREE.BoxGeometry(2.58, 0.12, 2.24), goldMat);
  trim.position.y = 2.1;
  const finial = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), goldMat);
  finial.position.y = 3.12;
  g.add(roof, trim, finial);

  outlineSolidChildren(g, 0.028);
  g.scale.setScalar(scale);
  return g;
}

function createTerracottaJar(scale = 1): THREE.Group {
  const g = new THREE.Group();
  const clayMat = createCartoonMaterial(0xce7042);
  const bandMat = createCartoonMaterial(0xf3bd42);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 12), clayMat);
  body.scale.set(1, 1.25, 1);
  body.position.y = 0.38;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.16, 12), clayMat);
  neck.position.y = 0.76;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.035, 8, 16), bandMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.83;
  g.add(body, neck, rim);
  outlineSolidChildren(g, 0.022);
  g.scale.setScalar(scale);
  return g;
}

/**
 * Location-matched 3D Cartoon environmental props around the arena perimeter
 * so every Explore world integrates naturally with its attached illustration.
 */
export function createLocationEnvironmentProps(locationId: LocationId): {
  group: THREE.Group;
  animatedBoats: THREE.Group[];
} {
  const group = new THREE.Group();
  const animatedBoats: THREE.Group[] = [];

  if (locationId === 'benteng-kuto-besak') {
    const pavilion = createGazeboPavilion(0.95);
    pavilion.position.set(-9.2, 0, -6.2);
    pavilion.rotation.y = 0.45;
    group.add(pavilion);

    [
      [-7.8, -2.5, 1.1],
      [-8.8, 3.8, 1.3],
      [7.6, 4.4, 1.2],
      [9.4, -1.6, 1.0],
    ].forEach(([x, z, s]) => {
      const boulder = createMossyBoulder(s);
      boulder.position.set(x, 0, z);
      group.add(boulder);
    });

    [
      [-6.5, 5.2],
      [6.2, 5.6],
      [-9.8, 0.4],
      [9.5, 1.5],
    ].forEach(([x, z]) => {
      const bush = createHibiscusBush(0.95);
      bush.position.set(x, 0, z);
      group.add(bush);
    });

    const pool = new THREE.Mesh(
      new THREE.CircleGeometry(3.2, 24),
      createCartoonMaterial(0x32bde8),
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(9.2, 0.04, -5.8);
    const cliff = createMossyBoulder(2.4);
    cliff.position.set(10.5, 0, -7.8);
    const fallStream = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 2.25, 0.28),
      new THREE.MeshBasicMaterial({ color: 0xc8f4ff, transparent: true, opacity: 0.86 }),
    );
    fallStream.position.set(9.8, 1.1, -7.0);
    fallStream.rotation.y = -0.4;
    group.add(pool, cliff, fallStream);
  } else if (locationId === 'museum-smb2') {
    const showcase = new THREE.Group();
    const woodMat = createCartoonMaterial(0x88522b);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xdff6ff,
      transparent: true,
      opacity: 0.42,
      roughness: 0.15,
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.8, 1.2), woodMat);
    base.position.y = 0.4;
    const glassBox = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 1.0), glassMat);
    glassBox.position.y = 1.35;
    glassBox.userData.skipOutline = true;
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(2.0, 0.65, 4),
      createCartoonMaterial(0xd45136),
    );
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.25, 1, 0.72);
    roof.position.y = 2.2;
    showcase.add(base, glassBox, roof);
    [-0.65, 0, 0.65].forEach((jx) => {
      const jar = createTerracottaJar(0.55);
      jar.position.set(jx, 0.82, 0);
      showcase.add(jar);
    });
    outlineSolidChildren(showcase, 0.024);
    showcase.position.set(-8.6, 0, -5.4);
    showcase.rotation.y = 0.55;
    group.add(showcase);

    const slabBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.25, 0.75),
      createCartoonMaterial(0xb4a897),
    );
    slabBase.position.set(-9.2, 0.12, -1.8);
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 1.25, 0.28),
      createCartoonMaterial(0xd4c6b2),
    );
    slab.position.set(-9.2, 0.85, -1.8);
    slab.rotation.y = 0.65;
    slab.rotation.x = -0.14;
    outlineSolidChildren(slabBase, 0.025);
    outlineSolidChildren(slab, 0.025);
    group.add(slabBase, slab);

    [
      [-6.5, -6.8],
      [6.5, -6.8],
    ].forEach(([lx, lz]) => {
      const lampPost = new THREE.Group();
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.09, 3.2, 8),
        createCartoonMaterial(0x473f3b),
      );
      pole.position.set(lx, 1.6, lz);
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 12, 10),
        new THREE.MeshBasicMaterial({ color: 0xffea8c }),
      );
      lamp.position.set(lx, 3.25, lz);
      const banner = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 1.4, 0.06),
        createCartoonMaterial(0xe34234),
      );
      banner.position.set(lx + (lx < 0 ? 0.35 : -0.35), 2.1, lz);
      lampPost.add(pole, lamp, banner);
      outlineSolidChildren(lampPost, 0.022);
      group.add(lampPost);
    });

    [
      [-6.2, 4.8],
      [6.4, 4.6],
    ].forEach(([bx, bz]) => {
      const bush = createHibiscusBush(1.05);
      bush.position.set(bx, 0, bz);
      group.add(bush);
    });
  } else if (locationId === 'jembatan-ampera') {
    const railGroup = new THREE.Group();
    const railMat = createCartoonMaterial(0xebd5b8);
    for (let i = 0; i <= 8; i++) {
      const ang = -Math.PI * 0.82 + (i / 8) * Math.PI * 0.64;
      const rx = Math.cos(ang) * 10.6;
      const rz = Math.sin(ang) * 10.6;
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.86, 0.42), railMat);
      post.position.set(rx, 0.43, rz);
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), railMat);
      sphere.position.set(rx, 0.98, rz);
      railGroup.add(post, sphere);

      if (i < 8) {
        const nextAng = -Math.PI * 0.82 + ((i + 1) / 8) * Math.PI * 0.64;
        const nx = Math.cos(nextAng) * 10.6;
        const nz = Math.sin(nextAng) * 10.6;
        const railLen = Math.hypot(nx - rx, nz - rz);
        const beam = new THREE.Mesh(new THREE.BoxGeometry(railLen, 0.18, 0.24), railMat);
        beam.position.set((rx + nx) / 2, 0.68, (rz + nz) / 2);
        beam.rotation.y = -Math.atan2(nz - rz, nx - rx);
        railGroup.add(beam);
      }
    }
    outlineSolidChildren(railGroup, 0.022);
    group.add(railGroup);

    const gazebo = createGazeboPavilion(0.95);
    gazebo.position.set(-9.2, 0, -4.6);
    gazebo.rotation.y = 0.55;
    group.add(gazebo);

    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.44, 0.58), railMat);
    bench.position.set(-6.4, 0.22, 5.2);
    bench.rotation.y = 0.45;
    outlineSolidChildren(bench, 0.025);
    group.add(bench);

    [
      [-7.6, 5.4],
      [7.8, 5.0],
    ].forEach(([bx, bz]) => {
      const bush = createHibiscusBush(0.95);
      bush.position.set(bx, 0, bz);
      group.add(bush);
    });

    const boat1 = createPerahuKetekGroup();
    boat1.scale.setScalar(1.45);
    boat1.position.set(-6, -0.02, -13.2);
    const boat2 = createPerahuKetekGroup();
    boat2.scale.setScalar(1.2);
    boat2.position.set(5, -0.02, -15.5);
    boat2.rotation.y = Math.PI;
    group.add(boat1, boat2);
    animatedBoats.push(boat1, boat2);
  } else if (locationId === 'pulau-kemaro') {
    const railPosts = new THREE.Group();
    const woodMat = createCartoonMaterial(0x9c6438);
    for (let i = 0; i <= 10; i++) {
      const ang = (i / 10) * Math.PI * 2;
      if (Math.abs(ang - Math.PI * 0.5) < 0.4) continue;
      const px = Math.cos(ang) * 10.6;
      const pz = Math.sin(ang) * 10.6;
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.96, 0.26), woodMat);
      post.position.set(px, 0.48, pz);
      railPosts.add(post);
    }
    outlineSolidChildren(railPosts, 0.022);
    group.add(railPosts);

    const gazebo = createGazeboPavilion(0.92);
    gazebo.position.set(8.6, 0, -5.6);
    gazebo.rotation.y = -0.5;
    group.add(gazebo);

    const lotusGroup = new THREE.Group();
    const padMat = createCartoonMaterial(0x63ba42);
    const lotusMat = createCartoonMaterial(0xf77ac1);
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2;
      const dist = 11.8 + (i % 3) * 1.1;
      const lx = Math.cos(ang) * dist;
      const lz = Math.sin(ang) * dist;
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.06, 12), padMat);
      pad.position.set(lx, 0.02, lz);
      lotusGroup.add(pad);
      if (i % 2 === 0) {
        const flower = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.26, 7), lotusMat);
        flower.rotation.x = Math.PI;
        flower.position.set(lx, 0.17, lz);
        lotusGroup.add(flower);
      }
    }
    outlineSolidChildren(lotusGroup, 0.02);
    group.add(lotusGroup);
  } else if (locationId === 'rumah-limas') {
    const bambooMat = createCartoonMaterial(0xd6b06b);
    [
      [-8.5, 4.5, 0.4],
      [8.5, 4.2, -0.45],
    ].forEach(([fx, fz, rot]) => {
      const fence = new THREE.Group();
      for (let b = -1; b <= 1; b++) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.92, 8), bambooMat);
        post.position.set(b * 0.85, 0.46, 0);
        fence.add(post);
      }
      const rail1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.0, 8), bambooMat);
      rail1.rotation.z = Math.PI / 2;
      rail1.position.y = 0.65;
      const rail2 = rail1.clone();
      rail2.position.y = 0.32;
      fence.add(rail1, rail2);
      outlineSolidChildren(fence, 0.02);
      fence.position.set(fx, 0, fz);
      fence.rotation.y = rot;
      group.add(fence);
    });

    [
      [-7.2, -4.6, 0.95],
      [-6.5, -4.2, 0.72],
      [7.4, -4.4, 0.9],
    ].forEach(([jx, jz, s]) => {
      const jar = createTerracottaJar(s);
      jar.position.set(jx, 0, jz);
      group.add(jar);
    });

    [
      [-8.6, 1.5],
      [8.8, 1.8],
      [-5.6, -6.2],
      [5.8, -6.2],
    ].forEach(([bx, bz]) => {
      const bush = createHibiscusBush(1.0);
      bush.position.set(bx, 0, bz);
      group.add(bush);
    });
  } else {
    const ruinsGroup = new THREE.Group();
    const stoneMat = createCartoonMaterial(0xb0a89b);
    const brickMat = createCartoonMaterial(0xd97343);

    [
      [-8.8, -4.4, 2.2],
      [-7.2, -5.6, 1.8],
    ].forEach(([px, pz, h]) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.68, h, 0.68), stoneMat);
      pillar.position.set(px, h / 2, pz);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.24, 0.86), stoneMat);
      cap.position.set(px, h + 0.12, pz);
      ruinsGroup.add(pillar, cap);
    });

    const ruinWallL = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.96, 0.72), brickMat);
    ruinWallL.position.set(-7.6, 0.48, -3.2);
    ruinWallL.rotation.y = 0.55;
    const ruinWallR = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.86, 0.72), brickMat);
    ruinWallR.position.set(8.2, 0.43, -4.4);
    ruinWallR.rotation.y = -0.5;
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.26, 16), stoneMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.rotation.z = -0.35;
    wheel.position.set(7.4, 0.68, -3.5);
    ruinsGroup.add(ruinWallL, ruinWallR, wheel);
    outlineSolidChildren(ruinsGroup, 0.028);
    group.add(ruinsGroup);

    [
      [-7.6, -2.0, 0.9],
      [6.4, -3.8, 0.85],
    ].forEach(([jx, jz, s]) => {
      const jar = createTerracottaJar(s);
      jar.position.set(jx, 0, jz);
      group.add(jar);
    });

    [
      [-9.2, 2.2],
      [9.0, 2.4],
    ].forEach(([bx, bz]) => {
      const bush = createHibiscusBush(1.0);
      bush.position.set(bx, 0, bz);
      group.add(bush);
    });
  }

  return { group, animatedBoats };
}
