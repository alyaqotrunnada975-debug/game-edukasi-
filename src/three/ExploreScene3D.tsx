import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SpatialAmbientSystem } from '../audio/spatialAmbient';
import { selectGaitAction } from '../game/gaitLogic';
import { AudioSettings, LocationConfig, RelicItem, SpriteAction } from '../types/game';
import {
  addCartoonOutline,
  createCartoonMaterial,
  createConfiguredRenderer,
  createContactShadowTexture,
  createFloorTexture,
  createSeamlessPanoramaMesh,
  detectSoftwareGl,
  scheduleAfterDraw,
  setupStudioEnvironment,
} from './glHelpers';
import { createCharacterBillboardTexture, setTextureAction } from './spriteSheets';
import {
  createInfoBoardGroup,
  createLocationEnvironmentProps,
  createMapLandmarkMiniature,
  createPalmTreeGroup,
  createRelicGroup,
} from './worldProps';

export type NearbyTarget =
  | { kind: 'guide'; id: string; label: string }
  | { kind: 'infoboard'; id: string; label: string }
  | { kind: 'relic'; id: string; label: string; iconType?: RelicItem['iconType'] };

interface ExploreScene3DProps {
  location: LocationConfig;
  collectedRelics: string[];
  readInfoBoard?: boolean;
  talkedToGuide?: boolean;
  modalOpen: boolean;
  audioSettings?: AudioSettings;
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
  cameraYawDeltaRef: React.MutableRefObject<number>;
  jumpSignalRef: React.MutableRefObject<number>;
  interactSignalRef: React.MutableRefObject<number>;
  onNearbyChange: (target: NearbyTarget | null) => void;
  onInteract: (target: NearbyTarget) => void;
  onStepSfx: () => void;
  onJumpSfx: () => void;
}

interface SparkleParticle {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  scale: number;
  spin: number;
}

const DEFAULT_AUDIO: AudioSettings = {
  muted: false,
  musicVolume: 0.7,
  sfxVolume: 0.8,
};

export function ExploreScene3D({
  location,
  collectedRelics,
  readInfoBoard = false,
  talkedToGuide = false,
  modalOpen,
  audioSettings = DEFAULT_AUDIO,
  joystickRef,
  cameraYawDeltaRef,
  jumpSignalRef,
  interactSignalRef,
  onNearbyChange,
  onInteract,
  onStepSfx,
  onJumpSfx,
}: ExploreScene3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const spatialRef = useRef<SpatialAmbientSystem | null>(null);

  const collectedRef = useRef(collectedRelics);
  const readInfoRef = useRef(readInfoBoard);
  const talkedGuideRef = useRef(talkedToGuide);
  const modalOpenRef = useRef(modalOpen);
  const audioSettingsRef = useRef(audioSettings);
  const onNearbyRef = useRef(onNearbyChange);
  const onInteractRef = useRef(onInteract);
  const onStepSfxRef = useRef(onStepSfx);
  const onJumpSfxRef = useRef(onJumpSfx);

  collectedRef.current = collectedRelics;
  readInfoRef.current = readInfoBoard;
  talkedGuideRef.current = talkedToGuide;
  modalOpenRef.current = modalOpen;
  audioSettingsRef.current = audioSettings;
  onNearbyRef.current = onNearbyChange;
  onInteractRef.current = onInteract;
  onStepSfxRef.current = onStepSfx;
  onJumpSfxRef.current = onJumpSfx;

  useEffect(() => {
    spatialRef.current?.updateSettings(audioSettings);
  }, [audioSettings]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const spatial = new SpatialAmbientSystem(location.id, audioSettingsRef.current);
    spatialRef.current = spatial;
    spatial.unlockAndStart();

    const isSoftwareGl = detectSoftwareGl();
    const renderer = createConfiguredRenderer(container, isSoftwareGl);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(location.fogColor);
    scene.fog = new THREE.Fog(location.fogColor, 28, 66);

    const envTex = setupStudioEnvironment(renderer, scene);

    const camera = new THREE.PerspectiveCamera(
      42,
      (container.clientWidth || 1280) / (container.clientHeight || 720),
      0.1,
      130,
    );
    camera.position.set(0, 4.6, 2.2 * 0.65 + 10.6);
    camera.lookAt(0, 1.15, 2.2 * 0.72 - 0.8);

    // Lighting matched to bright sunlit Palembang illustrations
    const hemi = new THREE.HemisphereLight(0xcbeeff, 0x7a6042, 0.96);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffefc9, 1.72);
    sun.position.set(10, 15, 8);
    if (!isSoftwareGl) {
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -16;
      sun.shadow.camera.right = 16;
      sun.shadow.camera.top = 16;
      sun.shadow.camera.bottom = -16;
      sun.shadow.bias = -0.0005;
    }
    scene.add(sun);

    // 360 Panorama Backdrop
    const pano = createSeamlessPanoramaMesh(
      location.backdropUrl,
      location.skyTopColor,
      location.skyBottomColor,
    );
    scene.add(pano.mesh);

    // Textured 3D Cartoon Exploration Ground matched to the scene
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const { map: floorMap } = createFloorTexture(location.floorTheme, maxAniso);
    const floorGeo = new THREE.CircleGeometry(15.5, 48);
    const floorMat = createCartoonMaterial(0xffffff, { map: floorMap });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Outer water / lush terrain surround matched cleanly per location (3D Cartoon)
    const outerColorMap: Record<LocationConfig['id'], number> = {
      'benteng-kuto-besak': 0x3b7e2a,
      'museum-smb2': 0x4c8a34,
      'jembatan-ampera': 0x2492cc,
      'pulau-kemaro': 0x258ec2,
      'rumah-limas': 0x4a8e2c,
      'taman-purbakala': 0x488232,
    };
    const isWaterOuter =
      location.id === 'jembatan-ampera' || location.id === 'pulau-kemaro';
    const outerGeo = new THREE.RingGeometry(15.2, 46, 48);
    const outerMat = createCartoonMaterial(outerColorMap[location.id]);
    const outerGround = new THREE.Mesh(outerGeo, outerMat);
    outerGround.rotation.x = -Math.PI / 2;
    outerGround.position.y = -0.03;
    scene.add(outerGround);

    // Soft 3D Cartoon border tufts to bridge courtyard edge to distant illustration
    if (!isWaterOuter) {
      const bushMat = createCartoonMaterial(0x4f9234);
      const bushLightMat = createCartoonMaterial(0x6eb044);
      const bushGeo = new THREE.DodecahedronGeometry(0.75, 0);
      for (let i = 0; i < 16; i++) {
        const ang = -Math.PI * 0.96 + (i / 15) * Math.PI * 0.92;
        const dist = 14.8 + (i % 3) * 0.55;
        const bush = new THREE.Mesh(bushGeo, i % 2 === 0 ? bushMat : bushLightMat);
        const s = 0.9 + (i % 3) * 0.2;
        bush.scale.set(1.35 * s, 0.72 * s, 1.15 * s);
        bush.position.set(Math.cos(ang) * dist, 0.28, Math.sin(ang) * dist);
        addCartoonOutline(bush, 0.032);
        scene.add(bush);
      }
    }

    // Perimeter tropical coconut palms (placed neatly behind/around path edges)
    for (let i = 0; i < 6; i++) {
      const ang = -Math.PI * 0.92 + (i / 5) * Math.PI * 0.84;
      const dist = 12.6 + (i % 2) * 1.4;
      const palm = createPalmTreeGroup(0.9 + (i % 3) * 0.14);
      palm.position.set(Math.cos(ang) * dist, 0, Math.sin(ang) * dist);
      scene.add(palm);
    }

    // Hero architectural 3D Cartoon landmark in the scenic rear matching the attached illustration
    const landmarkProp = createMapLandmarkMiniature(location.id);
    landmarkProp.scale.setScalar(2.35);
    landmarkProp.position.set(0, 0, -8.8);
    scene.add(landmarkProp);

    // Image-matched 3D Cartoon perimeter environment props
    const envProps = createLocationEnvironmentProps(location.id);
    scene.add(envProps.group);

    // Info Board prop with proximity highlight ring & glowing finial
    const infoBoard = createInfoBoardGroup(location.shortName);
    infoBoard.position.set(location.infoBoardPos[0], 0, location.infoBoardPos[1]);
    infoBoard.rotation.y = -0.25;
    scene.add(infoBoard);
    const infoRing = infoBoard.userData.ring as THREE.Mesh | undefined;
    const infoHighlightMats = (infoBoard.userData.highlightMats ?? []) as THREE.MeshToonMaterial[];

    // Guide NPC 2.5D Billboard + subtle ground beacon ring
    const shadowTex = createContactShadowTexture();
    const makeShadow = (w: number, h: number) => {
      const mat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.62,
      });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      m.rotation.x = -Math.PI / 2;
      m.position.y = 0.02;
      return m;
    };

    const guideTex = createCharacterBillboardTexture(location.guide.guideId);
    setTextureAction(guideTex, 'melambai');
    const guideMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 2.1),
      new THREE.MeshBasicMaterial({ map: guideTex, transparent: true, alphaTest: 0.28 }),
    );
    guideMesh.position.set(location.guidePos[0], 0.97, location.guidePos[1]);
    const guideShadow = makeShadow(1.3, 0.8);
    guideShadow.position.set(location.guidePos[0], 0.02, location.guidePos[1]);
    const guideRingMat = new THREE.MeshBasicMaterial({
      color: 0xf5b942,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.24,
    });
    const guideRing = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.92, 24), guideRingMat);
    guideRing.rotation.x = -Math.PI / 2;
    guideRing.position.set(location.guidePos[0], 0.025, location.guidePos[1]);
    scene.add(guideMesh, guideShadow, guideRing);

    // Petualang (Player) 2.5D Billboard
    const playerTex = createCharacterBillboardTexture('petualang');
    setTextureAction(playerTex, 'idle');
    const playerMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.95, 1.95),
      new THREE.MeshBasicMaterial({ map: playerTex, transparent: true, alphaTest: 0.28 }),
    );
    const playerPos = new THREE.Vector3(0, 0, 2.2);
    playerMesh.position.set(playerPos.x, 0.90, playerPos.z);
    const playerShadow = makeShadow(1.25, 0.78);
    playerShadow.position.set(playerPos.x, 0.02, playerPos.z);
    scene.add(playerMesh, playerShadow);

    // Si Kiko Companion 2.5D Billboard
    const kikoTex = createCharacterBillboardTexture('kiko');
    setTextureAction(kikoTex, 'idle');
    const kikoMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 1.4),
      new THREE.MeshBasicMaterial({ map: kikoTex, transparent: true, alphaTest: 0.28 }),
    );
    const kikoPos = new THREE.Vector3(-1.35, 0, 3.1);
    kikoMesh.position.set(kikoPos.x, 0.655, kikoPos.z);
    const kikoShadow = makeShadow(0.95, 0.6);
    kikoShadow.position.set(kikoPos.x, 0.02, kikoPos.z);
    scene.add(kikoMesh, kikoShadow);

    // 3 Collectible Relics
    const relicNodes = location.relics.map((relic) => {
      const built = createRelicGroup(relic);
      built.group.position.set(relic.position[0], 0, relic.position[1]);
      scene.add(built.group);
      return { relic, ...built };
    });

    // Tap-to-walk target marker
    const markerGeo = new THREE.RingGeometry(0.32, 0.48, 24);
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0xf5b942,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const walkMarker = new THREE.Mesh(markerGeo, markerMat);
    walkMarker.rotation.x = -Math.PI / 2;
    walkMarker.position.y = 0.03;
    walkMarker.visible = false;
    scene.add(walkMarker);

    // --- 3D Interaction Particle Burst & Shockwave Ring Pool (1 InstancedMesh = 1 draw call) ---
    const PARTICLE_COUNT = 48;
    const particleGeo = new THREE.OctahedronGeometry(0.068, 0);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const particleMesh = new THREE.InstancedMesh(particleGeo, particleMat, PARTICLE_COUNT);
    particleMesh.frustumCulled = false;

    const goldPalette = [
      new THREE.Color('#F5B942'),
      new THREE.Color('#FEF08A'),
      new THREE.Color('#34D399'),
      new THREE.Color('#FB923C'),
    ];
    const tealPalette = [
      new THREE.Color('#2DD4BF'),
      new THREE.Color('#F5B942'),
      new THREE.Color('#67E8F9'),
      new THREE.Color('#FEF08A'),
    ];

    const particles: SparkleParticle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      active: false,
      x: 0,
      y: -20,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0,
      maxLife: 1,
      scale: 0,
      spin: 4,
    }));

    const _pDummy = new THREE.Object3D();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      _pDummy.position.set(0, -20, 0);
      _pDummy.scale.setScalar(0);
      _pDummy.updateMatrix();
      particleMesh.setMatrixAt(i, _pDummy.matrix);
      particleMesh.setColorAt(i, goldPalette[i % goldPalette.length]);
    }
    particleMesh.instanceMatrix.needsUpdate = true;
    if (particleMesh.instanceColor) particleMesh.instanceColor.needsUpdate = true;
    scene.add(particleMesh);

    const burstRingMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const burstRing = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.72, 28), burstRingMat);
    burstRing.rotation.x = -Math.PI / 2;
    burstRing.position.set(0, 0.05, 0);
    burstRing.visible = false;
    scene.add(burstRing);

    let burstRingLife = 0;
    const burstRingMaxLife = 0.65;

    const spawnParticleBurst = (
      x: number,
      y: number,
      z: number,
      mode: 'gold' | 'teal',
    ) => {
      const palette = mode === 'teal' ? tealPalette : goldPalette;
      let spawned = 0;
      for (let i = 0; i < PARTICLE_COUNT && spawned < 30; i++) {
        const p = particles[i];
        if (!p.active || p.life > p.maxLife * 0.5) {
          const angle = (spawned / 30) * Math.PI * 2 + Math.random() * 0.35;
          const speed = 1.8 + Math.random() * 2.4;
          const ringR = 0.35 + Math.random() * 0.28;
          p.active = true;
          p.x = x + Math.cos(angle) * ringR;
          p.y = y + 0.15 + Math.random() * 0.35;
          p.z = z + Math.sin(angle) * ringR;
          p.vx = Math.cos(angle) * speed;
          p.vy = 2.8 + Math.random() * 2.6;
          p.vz = Math.sin(angle) * speed;
          p.life = 0;
          p.maxLife = 0.72 + Math.random() * 0.38;
          p.scale = 0.65 + Math.random() * 0.5;
          p.spin = (Math.random() - 0.5) * 10;
          particleMesh.setColorAt(i, palette[spawned % palette.length]);
          spawned++;
        }
      }
      if (particleMesh.instanceColor) particleMesh.instanceColor.needsUpdate = true;

      burstRing.position.set(x, 0.06, z);
      burstRing.scale.setScalar(0.6);
      burstRing.visible = true;
      burstRingMat.color.setHex(mode === 'teal' ? 0x2dd4bf : 0xfef08a);
      burstRingMat.opacity = 0.92;
      burstRingLife = 0.001;
    };

    // Track state diffs for completion bursts
    let prevCollectedCount = collectedRef.current.length;
    let prevCollectedSet = new Set(collectedRef.current);
    let prevReadInfo = readInfoRef.current;
    let prevTalkedGuide = talkedGuideRef.current;

    // Input State
    const keys = new Set<string>();
    let lastJumpSignal = jumpSignalRef.current;
    let lastInteractSignal = interactSignalRef.current;
    let autoWalkTarget: THREE.Vector3 | null = null;
    let nearestTarget: NearbyTarget | null = null;
    let lastReportedNearestKey = '';

    // Camera orbit state
    let cameraYaw = 0;
    let isDraggingCam = false;
    let dragStart = { x: 0, y: 0 };
    let pointerDownTime = 0;
    let pointerMovedDist = 0;

    // Smooth Character Physics & Gait State
    let playerVelX = 0;
    let playerVelZ = 0;
    let playerVy = 0;
    let playerY = 0;
    let playerFacing = 1;
    let walkPhase = 0;
    let pRunning = false;
    let kikoVelX = 0;
    let kikoVelZ = 0;
    let kikoFacing = 1;
    let kWalkPhase = 0;
    let squashX = 1;
    let squashY = 1;
    let stepAccum = 0;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const _hitPoint = new THREE.Vector3();

    const triggerJump = () => {
      if (playerY <= 0.02) {
        playerVy = 6.6;
        squashX = 0.86;
        squashY = 1.16;
        onJumpSfxRef.current();
      }
    };

    const triggerInteract = () => {
      if (nearestTarget && !modalOpenRef.current) {
        if (nearestTarget.kind === 'infoboard') {
          spawnParticleBurst(location.infoBoardPos[0], 1.25, location.infoBoardPos[1], 'teal');
        } else if (nearestTarget.kind === 'relic') {
          const rNode = relicNodes.find((n) => n.relic.id === nearestTarget!.id);
          if (rNode) {
            spawnParticleBurst(rNode.relic.position[0], 1.0, rNode.relic.position[1], 'gold');
          }
        } else if (nearestTarget.kind === 'guide') {
          spawnParticleBurst(location.guidePos[0], 1.15, location.guidePos[1], 'gold');
        }
        onInteractRef.current(nearestTarget);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      spatial.unlockAndStart();
      if (modalOpenRef.current) return;
      const code = e.code;
      if (
        code === 'KeyW' ||
        code === 'KeyA' ||
        code === 'KeyS' ||
        code === 'KeyD' ||
        code === 'ArrowUp' ||
        code === 'ArrowDown' ||
        code === 'ArrowLeft' ||
        code === 'ArrowRight'
      ) {
        keys.add(code);
        autoWalkTarget = null;
        walkMarker.visible = false;
      } else if (code === 'Space') {
        e.preventDefault();
        triggerJump();
      } else if (code === 'KeyE') {
        e.preventDefault();
        triggerInteract();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.code);
    };

    const clearKeys = () => {
      keys.clear();
      isDraggingCam = false;
    };

    const onPointerDown = (e: PointerEvent) => {
      spatial.unlockAndStart();
      if (modalOpenRef.current) return;
      isDraggingCam = true;
      dragStart = { x: e.clientX, y: e.clientY };
      pointerDownTime = performance.now();
      pointerMovedDist = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingCam) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      pointerMovedDist += Math.hypot(dx, dy);
      dragStart = { x: e.clientX, y: e.clientY };
      cameraYaw -= dx * 0.0055;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDraggingCam) return;
      isDraggingCam = false;
      const elapsed = performance.now() - pointerDownTime;
      if (pointerMovedDist < 10 && elapsed < 350 && !modalOpenRef.current) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        if (raycaster.ray.intersectPlane(groundPlane, _hitPoint)) {
          const r = Math.hypot(_hitPoint.x, _hitPoint.z);
          if (r > 9.5) {
            _hitPoint.multiplyScalar(9.5 / r);
          }
          autoWalkTarget = new THREE.Vector3(_hitPoint.x, 0, _hitPoint.z);
          walkMarker.position.set(_hitPoint.x, 0.03, _hitPoint.z);
          walkMarker.visible = true;
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearKeys);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    // Pre-allocated scratch vectors (zero GC in loop)
    const _moveDir = new THREE.Vector3();
    const _camForward = new THREE.Vector3();
    const _camRight = new THREE.Vector3();
    const _desiredCamPos = new THREE.Vector3();
    const _camLook = new THREE.Vector3();
    const _kikoDesired = new THREE.Vector3();

    let rafId = 0;
    let timerId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      // Check for newly collected relics or completed info/dialogue to trigger reward particles
      const collected = collectedRef.current;
      if (collected.length > prevCollectedCount) {
        collected.forEach((id) => {
          if (!prevCollectedSet.has(id)) {
            const node = relicNodes.find((n) => n.relic.id === id);
            if (node) {
              spawnParticleBurst(node.relic.position[0], 1.1, node.relic.position[1], 'gold');
            }
          }
        });
        prevCollectedCount = collected.length;
        prevCollectedSet = new Set(collected);
      }
      if (readInfoRef.current && !prevReadInfo) {
        prevReadInfo = true;
        spawnParticleBurst(location.infoBoardPos[0], 1.4, location.infoBoardPos[1], 'teal');
      }
      if (talkedGuideRef.current && !prevTalkedGuide) {
        prevTalkedGuide = true;
        spawnParticleBurst(location.guidePos[0], 1.25, location.guidePos[1], 'gold');
      }

      if (jumpSignalRef.current !== lastJumpSignal) {
        lastJumpSignal = jumpSignalRef.current;
        triggerJump();
      }
      if (interactSignalRef.current !== lastInteractSignal) {
        lastInteractSignal = interactSignalRef.current;
        triggerInteract();
      }

      if (cameraYawDeltaRef.current !== 0) {
        cameraYaw += cameraYawDeltaRef.current * dt * 1.9;
      }

      _camForward.set(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
      _camRight.set(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));
      _moveDir.set(0, 0, 0);
      let targetSpeed = 0;
      let hasMovementInput = false;

      if (!modalOpenRef.current) {
        let kx = 0;
        let ky = 0;
        if (keys.has('KeyA') || keys.has('ArrowLeft')) kx -= 1;
        if (keys.has('KeyD') || keys.has('ArrowRight')) kx += 1;
        if (keys.has('KeyW') || keys.has('ArrowUp')) ky += 1;
        if (keys.has('KeyS') || keys.has('ArrowDown')) ky -= 1;

        const jx = joystickRef.current.x;
        const jy = joystickRef.current.y;
        const inputX = Math.abs(kx) > 0 ? kx : jx;
        const inputY = Math.abs(ky) > 0 ? ky : jy;
        const inputMag = Math.hypot(inputX, inputY);

        if (inputMag > 0.12) {
          spatial.unlockAndStart();
          hasMovementInput = true;
          autoWalkTarget = null;
          walkMarker.visible = false;
          _moveDir.addScaledVector(_camRight, inputX);
          _moveDir.addScaledVector(_camForward, inputY);
          if (_moveDir.lengthSq() > 1) _moveDir.normalize();
          targetSpeed = 4.4 * Math.min(1, inputMag);
        } else if (autoWalkTarget) {
          const toTargetX = autoWalkTarget.x - playerPos.x;
          const toTargetZ = autoWalkTarget.z - playerPos.z;
          const dist = Math.hypot(toTargetX, toTargetZ);
          if (dist > 0.25) {
            hasMovementInput = true;
            _moveDir.set(toTargetX / dist, 0, toTargetZ / dist);
            targetSpeed = dist > 3.8 ? 5.2 : Math.min(4.4, dist * 3.2);
          } else {
            autoWalkTarget = null;
            walkMarker.visible = false;
          }
        }
      }

      // Smooth acceleration while crisp braking ensures an immediate upright ready stance ("posisi siap")
      const desiredVx = _moveDir.x * targetSpeed;
      const desiredVz = _moveDir.z * targetSpeed;
      const accelLambda = hasMovementInput ? 13 : 30;
      playerVelX = THREE.MathUtils.damp(playerVelX, desiredVx, accelLambda, dt);
      playerVelZ = THREE.MathUtils.damp(playerVelZ, desiredVz, accelLambda, dt);

      let currentSpeed = Math.hypot(playerVelX, playerVelZ);
      if (!hasMovementInput && currentSpeed < 0.35) {
        playerVelX = 0;
        playerVelZ = 0;
        currentSpeed = 0;
      }

      const isMoving = hasMovementInput && currentSpeed > 0.14;

      if (currentSpeed > 0.02) {
        playerPos.x += playerVelX * dt;
        playerPos.z += playerVelZ * dt;

        const r = Math.hypot(playerPos.x, playerPos.z);
        if (r > 9.8) {
          playerPos.x *= 9.8 / r;
          playerPos.z *= 9.8 / r;
        }

        const screenRightDot = (playerVelX / currentSpeed) * _camRight.x + (playerVelZ / currentSpeed) * _camRight.z;
        if (Math.abs(screenRightDot) > 0.14) {
          playerFacing = screenRightDot >= 0 ? 1 : -1;
        }

        if (isMoving) {
          walkPhase = (walkPhase + currentSpeed * dt * 2.2) % (Math.PI * 2);
          stepAccum += currentSpeed * dt;
          if (stepAccum > 1.35 && playerY <= 0.02) {
            stepAccum = 0;
            onStepSfxRef.current();
          }
        }
      } else {
        walkPhase = 0;
        stepAccum = 0;
      }

      // Jump gravity
      if (playerY > 0 || playerVy > 0) {
        playerY += playerVy * dt;
        playerVy -= 18.5 * dt;
        if (playerY <= 0) {
          playerY = 0;
          playerVy = 0;
          squashX = 1.14;
          squashY = 0.86;
        }
      }

      squashX = THREE.MathUtils.damp(squashX, 1, 12, dt);
      squashY = THREE.MathUtils.damp(squashY, 1, 12, dt);

      // Two-foot alternating stride cycle while walking/running, crisp 'idle' ready stance on stop
      if (currentSpeed > 4.75) pRunning = true;
      else if (currentSpeed < 4.1) pRunning = false;

      const pAction: SpriteAction = selectGaitAction({
        playerY,
        currentSpeed,
        hasMovementInput,
        isRunning: pRunning,
        walkPhase,
      });
      setTextureAction(playerTex, pAction);

      const moveFactor = isMoving ? THREE.MathUtils.clamp(currentSpeed / 4.2, 0, 1) : 0;
      const strideBob =
        playerY <= 0.02 && isMoving ? Math.abs(Math.sin(walkPhase * 2)) * 0.045 * moveFactor : 0;
      const idleBreath = !isMoving && playerY <= 0.02 ? Math.sin(t * 2.4) * 0.012 : 0;
      playerMesh.position.set(playerPos.x, 0.90 + playerY + strideBob + idleBreath, playerPos.z);
      playerMesh.lookAt(camera.position.x, playerMesh.position.y, camera.position.z);
      playerMesh.rotateZ(isMoving ? Math.sin(walkPhase) * 0.026 * moveFactor : 0);
      playerMesh.scale.set(playerFacing * squashX, squashY, 1);

      const shadowScale = Math.max(0.5, 1 - playerY * 0.25);
      playerShadow.position.set(playerPos.x, 0.02, playerPos.z);
      playerShadow.scale.setScalar(shadowScale);

      // Si Kiko smooth damped companion follow with alternating two-foot stride
      _kikoDesired.set(
        playerPos.x - _camRight.x * playerFacing * 1.25 - _camForward.x * 0.9,
        0,
        playerPos.z - _camRight.z * playerFacing * 1.25 - _camForward.z * 0.9,
      );
      const kdx = _kikoDesired.x - kikoPos.x;
      const kdz = _kikoDesired.z - kikoPos.z;
      const kDist = Math.hypot(kdx, kdz);
      const kHasInput = kDist > 0.38;
      const kDesSpeed = kHasInput ? Math.min(4.4, (kDist - 0.2) * 3.4) : 0;
      const kDesVx = kDist > 0.01 ? (kdx / kDist) * kDesSpeed : 0;
      const kDesVz = kDist > 0.01 ? (kdz / kDist) * kDesSpeed : 0;
      kikoVelX = THREE.MathUtils.damp(kikoVelX, kDesVx, kHasInput ? 10 : 24, dt);
      kikoVelZ = THREE.MathUtils.damp(kikoVelZ, kDesVz, kHasInput ? 10 : 24, dt);

      let kSpeed = Math.hypot(kikoVelX, kikoVelZ);
      if (!kHasInput && kSpeed < 0.32) {
        kikoVelX = 0;
        kikoVelZ = 0;
        kSpeed = 0;
      }
      const kMoving = kHasInput && kSpeed > 0.16;
      if (kSpeed > 0.02) {
        kikoPos.x += kikoVelX * dt;
        kikoPos.z += kikoVelZ * dt;
        const kDot = (kikoVelX / kSpeed) * _camRight.x + (kikoVelZ / kSpeed) * _camRight.z;
        if (Math.abs(kDot) > 0.14) kikoFacing = kDot >= 0 ? 1 : -1;
        if (kMoving) {
          kWalkPhase = (kWalkPhase + kSpeed * dt * 2.5) % (Math.PI * 2);
        }
      } else {
        kWalkPhase = 0;
        kikoFacing = playerFacing;
      }

      const kAction: SpriteAction = selectGaitAction({
        playerY: playerY > 0.2 ? playerY : 0,
        currentSpeed: kSpeed,
        hasMovementInput: kHasInput,
        isRunning: kSpeed > 3.5,
        walkPhase: kWalkPhase,
      });
      setTextureAction(kikoTex, kAction);
      const kMoveFactor = kMoving ? THREE.MathUtils.clamp(kSpeed / 4.0, 0, 1) : 0;
      const kBob = kMoving
        ? Math.abs(Math.sin(kWalkPhase * 2)) * 0.048 * kMoveFactor
        : Math.sin(t * 2.8) * 0.014;
      kikoMesh.position.set(kikoPos.x, 0.655 + kBob + playerY * 0.35, kikoPos.z);
      kikoMesh.lookAt(camera.position.x, kikoMesh.position.y, camera.position.z);
      kikoMesh.rotateZ(kMoving ? Math.sin(kWalkPhase) * 0.032 * kMoveFactor : 0);
      kikoMesh.scale.set(kikoFacing, 1, 1);
      kikoShadow.position.set(kikoPos.x, 0.02, kikoPos.z);

      // Guide NPC billboard
      const guideDist = Math.hypot(
        playerPos.x - location.guidePos[0],
        playerPos.z - location.guidePos[1],
      );
      setTextureAction(
        guideTex,
        guideDist < 3.4 ? 'berbicara' : Math.floor(t * 1.4) % 3 === 0 ? 'menunjuk' : 'melambai',
      );
      guideMesh.lookAt(camera.position.x, guideMesh.position.y, camera.position.z);

      // Proximity target search
      let bestTarget: NearbyTarget | null = null;
      let bestDist = 2.55;

      if (guideDist < bestDist) {
        bestDist = guideDist;
        bestTarget = {
          kind: 'guide',
          id: location.guide.guideId,
          label: `Bicara dengan ${location.guide.speakerName}`,
        };
      }

      const infoDist = Math.hypot(
        playerPos.x - location.infoBoardPos[0],
        playerPos.z - location.infoBoardPos[1],
      );
      if (infoDist < bestDist) {
        bestDist = infoDist;
        bestTarget = {
          kind: 'infoboard',
          id: 'infoboard',
          label: 'Baca Papan Informasi',
        };
      }

      // Highlight feedback on Guide & Papan Informasi
      const guideNear = bestTarget?.kind === 'guide';
      guideRingMat.opacity = guideNear ? 0.65 + Math.sin(t * 6) * 0.2 : 0.22;
      guideRing.scale.setScalar(guideNear ? 1.12 + Math.sin(t * 6) * 0.06 : 1);

      const infoNear = bestTarget?.kind === 'infoboard';
      if (infoRing) {
        const iMat = infoRing.material as THREE.MeshBasicMaterial;
        iMat.opacity = infoNear ? 0.72 + Math.sin(t * 6) * 0.22 : 0.34;
        infoRing.scale.setScalar(infoNear ? 1.1 + Math.sin(t * 6) * 0.07 : 1);
      }
      infoHighlightMats.forEach((m, idx) => {
        if (infoNear) {
          m.emissive.setHex(idx === 0 ? 0x6b4f08 : 0x0e3b3a);
        } else {
          m.emissive.setHex(0x000000);
        }
      });

      // Rotate, float & highlight collectibles
      relicNodes.forEach((node, idx) => {
        const isCollected = collected.includes(node.relic.id);
        node.artifact.visible = !isCollected;
        node.ring.visible = !isCollected;
        node.aura.visible = !isCollected;

        if (!isCollected) {
          const rDist = Math.hypot(
            playerPos.x - node.relic.position[0],
            playerPos.z - node.relic.position[1],
          );
          if (rDist < bestDist) {
            bestDist = rDist;
            bestTarget = {
              kind: 'relic',
              id: node.relic.id,
              label: `Ambil ${node.relic.name}`,
              iconType: node.relic.iconType,
            };
          }

          const isRelicNear = rDist < 2.55;
          node.artifact.rotation.y = t * (isRelicNear ? 2.4 : 1.35) + idx;
          node.artifact.position.y = 1.08 + Math.sin(t * 2.8 + idx) * 0.12;
          node.ring.scale.setScalar(
            (isRelicNear ? 1.24 : 1.0) + Math.sin(t * (isRelicNear ? 6 : 3.5) + idx) * 0.09,
          );
          (node.ring.material as THREE.MeshBasicMaterial).opacity = isRelicNear ? 0.95 : 0.62;

          // Vertical spinning highlight aura when player approaches relic
          const auraMat = node.aura.material as THREE.MeshBasicMaterial;
          auraMat.opacity = isRelicNear ? 0.75 + Math.sin(t * 7) * 0.2 : 0.0;
          node.aura.rotation.y = -t * 2.5;
          node.aura.rotation.x = Math.sin(t * 2) * 0.35;
          node.aura.position.y = node.artifact.position.y;

          node.highlightMats.forEach((m) => {
            m.emissive.setHex(isRelicNear ? 0x5c3e08 : 0x000000);
          });
        }
      });

      nearestTarget = bestTarget;
      const nextKey = bestTarget ? `${bestTarget.kind}:${bestTarget.id}` : '';
      if (nextKey !== lastReportedNearestKey) {
        lastReportedNearestKey = nextKey;
        onNearbyRef.current(bestTarget);
      }

      if (walkMarker.visible) {
        walkMarker.scale.setScalar(1 + Math.sin(t * 8) * 0.15);
      }

      // Animate cruising Perahu Ketek on Sungai Musi
      envProps.animatedBoats.forEach((boat, idx) => {
        const dir = idx % 2 === 0 ? 1 : -1;
        boat.position.x += dir * dt * 1.15;
        boat.position.y = -0.02 + Math.sin(t * 2.4 + idx) * 0.03;
        if (boat.position.x > 16) boat.position.x = -16;
        if (boat.position.x < -16) boat.position.x = 16;
      });

      // Update active interaction sparkle particles
      let anyParticleDirty = false;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];
        if (!p.active) continue;
        anyParticleDirty = true;
        p.life += dt;
        if (p.life >= p.maxLife) {
          p.active = false;
          _pDummy.position.set(0, -20, 0);
          _pDummy.scale.setScalar(0);
          _pDummy.updateMatrix();
          particleMesh.setMatrixAt(i, _pDummy.matrix);
        } else {
          p.vy -= 6.8 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;
          const fade = 1 - p.life / p.maxLife;
          _pDummy.position.set(p.x, p.y, p.z);
          _pDummy.rotation.set(t * p.spin, t * p.spin * 0.7, 0);
          _pDummy.scale.setScalar(p.scale * fade);
          _pDummy.updateMatrix();
          particleMesh.setMatrixAt(i, _pDummy.matrix);
        }
      }
      if (anyParticleDirty) {
        particleMesh.instanceMatrix.needsUpdate = true;
      }

      if (burstRingLife > 0) {
        burstRingLife += dt;
        const progress = burstRingLife / burstRingMaxLife;
        if (progress >= 1) {
          burstRing.visible = false;
          burstRingLife = 0;
        } else {
          burstRing.scale.setScalar(0.6 + progress * 2.8);
          burstRingMat.opacity = 0.9 * (1 - progress);
        }
      }

      // Update 3D spatial ambient audio listener position & camera yaw
      spatial.updateListener([playerPos.x, playerY + 1.1, playerPos.z], cameraYaw);
      container.dataset.spatialActive = JSON.stringify(spatial.getDebugSummary().activeGains);

      // Smooth damped camera follow with orbit yaw
      const camDist = 10.6;
      const camHeight = 4.6;
      _desiredCamPos.set(
        playerPos.x * 0.65 + Math.sin(cameraYaw) * camDist,
        camHeight,
        playerPos.z * 0.65 + Math.cos(cameraYaw) * camDist,
      );
      camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredCamPos.x, 7, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredCamPos.y, 7, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredCamPos.z, 7, dt);
      _camLook.set(playerPos.x * 0.72, 1.15, playerPos.z * 0.72 - 0.8);
      camera.lookAt(_camLook);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        scheduleAfterDraw(renderer, tick, (id) => {
          timerId = id;
        });
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      ro.disconnect();
      spatial.dispose();
      spatialRef.current = null;
      delete container.dataset.spatialActive;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearKeys);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      pano.dispose();
      floorMap.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      outerGeo.dispose();
      outerMat.dispose();
      shadowTex.dispose();
      guideTex.dispose();
      playerTex.dispose();
      kikoTex.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [location.id]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full"
      data-testid="explore-canvas"
    />
  );
}
