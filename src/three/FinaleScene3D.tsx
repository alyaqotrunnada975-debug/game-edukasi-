import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
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
import { createMapLandmarkMiniature, createPalmTreeGroup } from './worldProps';

export function FinaleScene3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    const renderer = createConfiguredRenderer(container, isSoftwareGl);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#d5e6c5');
    scene.fog = new THREE.Fog('#d5e6c5', 20, 56);

    const envTex = setupStudioEnvironment(renderer, scene);

    const camera = new THREE.PerspectiveCamera(
      42,
      (container.clientWidth || 1280) / (container.clientHeight || 720),
      0.1,
      120,
    );
    camera.position.set(0, 2.7, 9.6);
    camera.lookAt(0, 1.35, 0);

    const hemi = new THREE.HemisphereLight(0xbbe8f5, 0x7b5c3e, 0.95);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffe5b8, 1.7);
    sun.position.set(6, 12, 8);
    scene.add(sun);

    const pano = createSeamlessPanoramaMesh(
      '/assets/aistudio/Jungle_Temple_Ruins_Adventure-4_e5999158.png',
      '#2ea3e8',
      '#d9f2f7',
    );
    scene.add(pano.mesh);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const { map: floorMap } = createFloorTexture('candi-ruins', maxAniso);
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(18, 40),
      createCartoonMaterial(0xffffff, { map: floorMap }),
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const candi = createMapLandmarkMiniature('taman-purbakala');
    candi.scale.setScalar(2.4);
    candi.position.set(0, 0, -6.5);
    scene.add(candi);

    const palmL = createPalmTreeGroup(1.1);
    palmL.position.set(-5.8, 0, -2.5);
    const palmR = createPalmTreeGroup(1.1);
    palmR.position.set(5.8, 0, -2.5);
    scene.add(palmL, palmR);

    // Celebrating Characters: Kak Arya, Petualang, Si Kiko
    const shadowTex = createContactShadowTexture();
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.6,
    });

    const aryaTex = createCharacterBillboardTexture('arya');
    setTextureAction(aryaTex, 'merayakan');
    const aryaMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.3, 2.3),
      new THREE.MeshBasicMaterial({ map: aryaTex, transparent: true, alphaTest: 0.28 }),
    );
    aryaMesh.position.set(-2.3, 1.15, 0.8);
    const aryaShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.85), shadowMat);
    aryaShadow.rotation.x = -Math.PI / 2;
    aryaShadow.position.set(-2.3, 0.02, 0.8);

    const petTex = createCharacterBillboardTexture('petualang');
    setTextureAction(petTex, 'merayakan');
    const petMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.35, 2.35),
      new THREE.MeshBasicMaterial({ map: petTex, transparent: true, alphaTest: 0.28 }),
    );
    petMesh.position.set(0, 1.18, 1.2);
    const petShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.9), shadowMat);
    petShadow.rotation.x = -Math.PI / 2;
    petShadow.position.set(0, 0.02, 1.2);

    const kikoTex = createCharacterBillboardTexture('kiko');
    setTextureAction(kikoTex, 'merayakan');
    const kikoMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 1.7),
      new THREE.MeshBasicMaterial({ map: kikoTex, transparent: true, alphaTest: 0.28 }),
    );
    kikoMesh.position.set(2.15, 0.85, 1.0);
    const kikoShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.68), shadowMat);
    kikoShadow.rotation.x = -Math.PI / 2;
    kikoShadow.position.set(2.15, 0.02, 1.0);

    scene.add(aryaMesh, aryaShadow, petMesh, petShadow, kikoMesh, kikoShadow);

    // 3D Confetti InstancedMesh Pool (140 particles, zero GC in loop)
    const CONFETTI_COUNT = 140;
    const confettiGeo = new THREE.PlaneGeometry(0.16, 0.24);
    const confettiMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    const confettiMesh = new THREE.InstancedMesh(confettiGeo, confettiMat, CONFETTI_COUNT);
    confettiMesh.frustumCulled = false;

    const palette = [
      new THREE.Color('#F5B942'),
      new THREE.Color('#B93829'),
      new THREE.Color('#0E5A5C'),
      new THREE.Color('#38BDF8'),
      new THREE.Color('#FAF5EB'),
    ];
    const confettiState = Array.from({ length: CONFETTI_COUNT }, (_, i) => {
      confettiMesh.setColorAt(i, palette[i % palette.length]);
      return {
        x: (Math.random() - 0.5) * 12,
        y: Math.random() * 8 + 1,
        z: (Math.random() - 0.5) * 6 + 0.5,
        vy: 1.1 + Math.random() * 1.4,
        rotSpeed: (Math.random() - 0.5) * 5,
        phase: Math.random() * Math.PI * 2,
      };
    });
    if (confettiMesh.instanceColor) confettiMesh.instanceColor.needsUpdate = true;
    scene.add(confettiMesh);

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

    const _dummy = new THREE.Object3D();
    let rafId = 0;
    let timerId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      camera.position.x = Math.sin(t * 0.4) * 0.45;
      camera.lookAt(0, 1.35, 0);

      aryaMesh.position.y = 1.15 + Math.abs(Math.sin(t * 3.1)) * 0.14;
      petMesh.position.y = 1.18 + Math.abs(Math.sin(t * 3.5 + 0.8)) * 0.18;
      kikoMesh.position.y = 0.85 + Math.abs(Math.sin(t * 4.0 + 1.6)) * 0.2;

      aryaMesh.lookAt(camera.position.x, aryaMesh.position.y, camera.position.z);
      petMesh.lookAt(camera.position.x, petMesh.position.y, camera.position.z);
      kikoMesh.lookAt(camera.position.x, kikoMesh.position.y, camera.position.z);

      for (let i = 0; i < CONFETTI_COUNT; i++) {
        const c = confettiState[i];
        c.y -= c.vy * dt;
        c.x += Math.sin(t * 2 + c.phase) * 0.5 * dt;
        if (c.y < 0.05) {
          c.y = 8.2;
          c.x = (Math.random() - 0.5) * 12;
        }
        _dummy.position.set(c.x, c.y, c.z);
        _dummy.rotation.set(t * c.rotSpeed, t * c.rotSpeed * 0.7, c.phase);
        _dummy.updateMatrix();
        confettiMesh.setMatrixAt(i, _dummy.matrix);
      }
      confettiMesh.instanceMatrix.needsUpdate = true;

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
      pano.dispose();
      floorMap.dispose();
      shadowTex.dispose();
      aryaTex.dispose();
      petTex.dispose();
      kikoTex.dispose();
      confettiGeo.dispose();
      confettiMat.dispose();
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" data-testid="finale-canvas" />;
}
