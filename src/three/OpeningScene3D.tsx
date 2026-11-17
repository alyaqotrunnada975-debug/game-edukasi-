import { useEffect, useRef } from 'react';
import * as THREE from 'three';
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
import { createPalmTreeGroup, createPerahuKetekGroup } from './worldProps';

export function OpeningScene3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    const renderer = createConfiguredRenderer(container, isSoftwareGl);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#cbe6f7');
    scene.fog = new THREE.Fog('#cbe6f7', 20, 56);

    const envTex = setupStudioEnvironment(renderer, scene);

    const camera = new THREE.PerspectiveCamera(
      42,
      (container.clientWidth || 1280) / (container.clientHeight || 720),
      0.1,
      120,
    );
    camera.position.set(-0.6, 2.38, 9.6);
    camera.lookAt(0.55, 1.32, 0);

    // Lighting
    const hemi = new THREE.HemisphereLight(0xbbe6ff, 0x7c6248, 0.95);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff0cc, 1.7);
    sun.position.set(8, 12, 6);
    if (!isSoftwareGl) {
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -14;
      sun.shadow.camera.right = 14;
      sun.shadow.camera.top = 14;
      sun.shadow.camera.bottom = -14;
      sun.shadow.bias = -0.0005;
    }
    scene.add(sun);

    // 360 Panorama Backdrop in true 16:9 proportions (not squished)
    const pano = createSeamlessPanoramaMesh(
      '/assets/aistudio/Vibrant_Musi_Riverfront_and_Ampera_Bridge-2_08919466.png',
      '#1f94ee',
      '#d2ecfc',
      42,
    );
    pano.mesh.rotation.y = Math.PI * 0.62;
    pano.mesh.position.y -= 1.05;
    scene.add(pano.mesh);

    // Wide 3D Cartoon Stone Riverfront Promenade Foreground (covers ultra-wide & mobile landscape cleanly)
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const { map: floorMap } = createFloorTexture('musi-boardwalk', maxAniso);
    floorMap.repeat.set(7, 3);
    const pierGeo = new THREE.BoxGeometry(28, 0.5, 10);
    const pierMat = createCartoonMaterial(0xffffff, { map: floorMap });
    const pier = new THREE.Mesh(pierGeo, pierMat);
    pier.position.set(0.8, -0.25, 1.5);
    pier.receiveShadow = true;
    scene.add(pier);

    // Clean low 3D Cartoon stone curb along rear edge of promenade (blends smoothly into riverfront backdrop)
    const railStoneMat = createCartoonMaterial(0xdec8aa);
    const curb = new THREE.Mesh(new THREE.BoxGeometry(28, 0.16, 0.36), railStoneMat);
    curb.position.set(0.8, 0.08, -3.38);
    addCartoonOutline(curb, 0.02);
    scene.add(curb);

    // Bright turquoise Musi River beyond promenade
    const waterGeo = new THREE.PlaneGeometry(96, 52);
    const waterMat = createCartoonMaterial(0x289fd6);
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.32, -18);
    scene.add(water);

    // Perahu Ketek cruising across Sungai Musi
    const ketek = createPerahuKetekGroup();
    ketek.scale.setScalar(1.3);
    ketek.position.set(-5, -0.26, -7.0);
    scene.add(ketek);

    // Tropical palms framing outer edges without blocking characters or sound button
    const palmL = createPalmTreeGroup(1.02);
    palmL.position.set(-7.6, 0, -2.4);
    const palmR = createPalmTreeGroup(0.95);
    palmR.position.set(9.8, 0, -3.1);
    scene.add(palmL, palmR);

    // 2.5D Billboard Characters (Petualang + Si Kiko) positioned cleanly in right-half spotlight
    const shadowTex = createContactShadowTexture();
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    });

    const petualangTex = createCharacterBillboardTexture('petualang');
    setTextureAction(petualangTex, 'melambai');
    const petualangMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.45, 2.45),
      new THREE.MeshBasicMaterial({ map: petualangTex, transparent: true, alphaTest: 0.28 }),
    );
    petualangMesh.position.set(2.65, 1.22, 1.0);
    scene.add(petualangMesh);

    const petShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.9), shadowMat);
    petShadow.rotation.x = -Math.PI / 2;
    petShadow.position.set(2.65, 0.02, 1.0);
    scene.add(petShadow);

    const kikoTex = createCharacterBillboardTexture('kiko');
    setTextureAction(kikoTex, 'melambai');
    const kikoMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.78, 1.78),
      new THREE.MeshBasicMaterial({ map: kikoTex, transparent: true, alphaTest: 0.28 }),
    );
    kikoMesh.position.set(4.45, 0.89, 1.45);
    scene.add(kikoMesh);

    const kikoShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.7), shadowMat);
    kikoShadow.rotation.x = -Math.PI / 2;
    kikoShadow.position.set(4.45, 0.02, 1.45);
    scene.add(kikoShadow);

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

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      // Gentle live camera parallax & waving motion
      camera.position.x = -0.6 + Math.sin(t * 0.35) * 0.2;
      camera.position.y = 2.38 + Math.cos(t * 0.45) * 0.07;
      camera.lookAt(0.55, 1.32, 0);

      // Wave animation alternation between melambai and idle
      const waveCycle = Math.floor(t * 2.2) % 4 !== 0;
      setTextureAction(petualangTex, waveCycle ? 'melambai' : 'idle');
      setTextureAction(kikoTex, Math.floor(t * 2.5 + 1) % 3 !== 0 ? 'melambai' : 'merayakan');

      petualangMesh.position.y = 1.18 + Math.abs(Math.sin(t * 2.4)) * 0.05;
      kikoMesh.position.y = 0.86 + Math.abs(Math.sin(t * 3.1)) * 0.07;

      // Billboard orientation toward camera horizontally
      petualangMesh.lookAt(camera.position.x, petualangMesh.position.y, camera.position.z);
      kikoMesh.lookAt(camera.position.x, kikoMesh.position.y, camera.position.z);

      // Cruise perahu ketek across river
      ketek.position.x += dt * 1.15;
      ketek.position.y = -0.26 + Math.sin(t * 2.2) * 0.03;
      if (ketek.position.x > 14) ketek.position.x = -14;

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
      petualangTex.dispose();
      kikoTex.dispose();
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" data-testid="opening-canvas" />;
}
