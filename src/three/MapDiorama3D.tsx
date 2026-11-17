import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LOCATIONS } from '../data/locations';
import { isLocationCompleted, isLocationUnlocked } from '../game/progression';
import { LocationId, PlayerProgress } from '../types/game';
import {
  addCartoonOutline,
  createCartoonMaterial,
  createConfiguredRenderer,
  detectSoftwareGl,
  scheduleAfterDraw,
  setupStudioEnvironment,
} from './glHelpers';
import {
  createMapLandmarkMiniature,
  createMapPinLabel,
  createPalmTreeGroup,
  createPerahuKetekGroup,
} from './worldProps';

interface MapDiorama3DProps {
  progress: PlayerProgress;
  selectedLocationId: LocationId;
  onSelectLocation: (id: LocationId) => void;
}

export function MapDiorama3D({
  progress,
  selectedLocationId,
  onSelectLocation,
}: MapDiorama3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(progress);
  const selectedRef = useRef(selectedLocationId);
  const onSelectRef = useRef(onSelectLocation);

  progressRef.current = progress;
  selectedRef.current = selectedLocationId;
  onSelectRef.current = onSelectLocation;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    const renderer = createConfiguredRenderer(container, isSoftwareGl);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#c7e4eb');
    scene.fog = new THREE.Fog('#c7e4eb', 24, 60);

    const envTex = setupStudioEnvironment(renderer, scene);

    const camera = new THREE.PerspectiveCamera(
      42,
      (container.clientWidth || 1280) / (container.clientHeight || 720),
      0.1,
      140,
    );
    camera.position.set(0, 12.5, 16.5);
    camera.lookAt(0, 0.2, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.43;
    controls.minPolarAngle = Math.PI * 0.16;
    controls.minDistance = 10;
    controls.maxDistance = 24;
    controls.target.set(0, 0.3, 0);

    // Warm/cool studio lighting
    const hemi = new THREE.HemisphereLight(0xbbe8f5, 0x5c6d45, 0.9);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff0d4, 1.65);
    sun.position.set(12, 18, 10);
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

    // Surrounding Ocean / Musi Estuary plane (3D Cartoon)
    const seaGeo = new THREE.PlaneGeometry(110, 110);
    const seaMat = createCartoonMaterial(0x1f8594);
    const sea = new THREE.Mesh(seaGeo, seaMat);
    sea.rotation.x = -Math.PI / 2;
    sea.position.y = -0.35;
    scene.add(sea);

    // Sculpted South Sumatra Island Base (3D Cartoon)
    const islandGeo = new THREE.CylinderGeometry(11.5, 12.6, 0.9, 32);
    const islandMat = createCartoonMaterial(0x64a448);
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.scale.set(1.15, 1, 0.72);
    island.position.y = -0.3;
    island.receiveShadow = true;
    addCartoonOutline(island, 0.055);
    scene.add(island);

    // Sandy coastal rim (3D Cartoon)
    const beachGeo = new THREE.CylinderGeometry(12.1, 13.1, 0.45, 32);
    const beachMat = createCartoonMaterial(0xe6cb94);
    const beach = new THREE.Mesh(beachGeo, beachMat);
    beach.scale.set(1.16, 1, 0.73);
    beach.position.y = -0.45;
    addCartoonOutline(beach, 0.05);
    scene.add(beach);

    // Winding Sungai Musi River Ribbon cutting across the island (3D Cartoon)
    const riverPoints = [
      new THREE.Vector3(-13.5, 0.17, 2.2),
      new THREE.Vector3(-7.0, 0.17, 1.4),
      new THREE.Vector3(-1.5, 0.17, 0.4),
      new THREE.Vector3(3.5, 0.17, -0.4),
      new THREE.Vector3(9.0, 0.17, 0.8),
      new THREE.Vector3(14.0, 0.17, 1.8),
    ];
    const riverCurve = new THREE.CatmullRomCurve3(riverPoints);
    const riverGeo = new THREE.TubeGeometry(riverCurve, 40, 0.75, 6, false);
    riverGeo.scale(1, 0.06, 1);
    const riverMat = createCartoonMaterial(0x2ca7bc);
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.position.y = 0.14;
    scene.add(river);

    // Animated Perahu Ketek boats along Sungai Musi
    const ketek1 = createPerahuKetekGroup();
    ketek1.scale.setScalar(0.55);
    const ketek2 = createPerahuKetekGroup();
    ketek2.scale.setScalar(0.5);
    scene.add(ketek1, ketek2);

    // Coconut Palms scattered across the island banks
    const palmCoords: [number, number, number][] = [
      [-10.2, -3.2, 0.55],
      [-8.5, 4.8, 0.5],
      [-5.2, -4.4, 0.58],
      [-1.0, 4.6, 0.52],
      [2.4, -4.6, 0.6],
      [6.8, -3.5, 0.54],
      [8.8, 4.2, 0.52],
      [-11.2, 0.2, 0.48],
    ];
    palmCoords.forEach(([x, z, s]) => {
      const palm = createPalmTreeGroup(s);
      palm.position.set(x, 0.14, z);
      scene.add(palm);
    });

    // 6 Interactive Landmark Miniatures + Beacon Rings + Hit Proxies
    const clickables: THREE.Mesh[] = [];
    const landmarkNodes = new Map<
      LocationId,
      { group: THREE.Group; ring: THREE.Mesh; ringMat: THREE.MeshBasicMaterial }
    >();

    LOCATIONS.forEach((loc) => {
      const [mx, mz] = loc.mapCoords;
      const mini = createMapLandmarkMiniature(loc.id);
      mini.position.set(mx, 0.16, mz);
      scene.add(mini);

      const pinLabel = createMapPinLabel(loc.order, loc.shortName);
      pinLabel.position.set(mx, 2.65, mz);
      scene.add(pinLabel);

      const ringGeo = new THREE.RingGeometry(1.25, 1.48, 28);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf5b942,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(mx, 0.2, mz);
      scene.add(ring);

      // Simplified invisible hit proxy for fast raycasting
      const proxy = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 1.4, 2.2, 12),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      proxy.position.set(mx, 1.0, mz);
      proxy.userData.locationId = loc.id;
      scene.add(proxy);
      clickables.push(proxy);

      landmarkNodes.set(loc.id, { group: mini, ring, ringMat });
    });

    // Raycast click & hover
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const updatePointer = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 8) return; // Was dragging camera
      updatePointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickables, false);
      if (hits.length > 0) {
        const locId = hits[0].object.userData.locationId as LocationId;
        if (locId) {
          onSelectRef.current(locId);
        }
      }
    };

    let lastMove = 0;
    const onPointerMove = (e: PointerEvent) => {
      const now = Date.now();
      if (now - lastMove < 50) return;
      lastMove = now;
      updatePointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickables, false);
      renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

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

    let rafId = 0;
    let timerId = 0;
    let disposed = false;
    const clock = new THREE.Clock();
    const _boatPos = new THREE.Vector3();
    const _boatTan = new THREE.Vector3();

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const curProgress = progressRef.current;
      const curSelected = selectedRef.current;

      controls.update();

      // Update Perahu Ketek positions along Sungai Musi curve
      const u1 = (t * 0.055) % 1;
      riverCurve.getPointAt(u1, _boatPos);
      riverCurve.getTangentAt(u1, _boatTan);
      ketek1.position.set(_boatPos.x, 0.2, _boatPos.z);
      ketek1.rotation.y = Math.atan2(-_boatTan.z, _boatTan.x);

      const u2 = ((t * 0.045 + 0.52) % 1);
      riverCurve.getPointAt(1 - u2, _boatPos);
      riverCurve.getTangentAt(1 - u2, _boatTan);
      ketek2.position.set(_boatPos.x, 0.2, _boatPos.z);
      ketek2.rotation.y = Math.atan2(_boatTan.z, -_boatTan.x);

      // Update landmark highlight states
      for (const loc of LOCATIONS) {
        const node = landmarkNodes.get(loc.id);
        if (!node) continue;
        const unlocked = isLocationUnlocked(curProgress, loc.id);
        const completed = isLocationCompleted(curProgress.locations[loc.id], loc.relics.length);
        const isSel = curSelected === loc.id;

        const targetScale = isSel ? 1.18 : unlocked ? 1.0 : 0.85;
        const nextScale = THREE.MathUtils.damp(node.group.scale.x, targetScale, 8, dt);
        node.group.scale.setScalar(nextScale);

        if (completed) {
          node.ringMat.color.setHex(0xf5b942);
        } else if (unlocked) {
          node.ringMat.color.setHex(0x28b89a);
        } else {
          node.ringMat.color.setHex(0x7c878e);
        }
        node.ringMat.opacity = isSel ? 0.95 : unlocked ? 0.65 : 0.35;
        node.ring.scale.setScalar(isSel ? 1.12 + Math.sin(t * 4) * 0.08 : 1.0);
      }

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
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      controls.dispose();
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full"
      data-testid="map-diorama-canvas"
    />
  );
}
