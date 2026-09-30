/**
 * Wunderkammer — Room 04: Three.js Scene Manager
 * Sets up 3D painting plane, dynamic raking lamp, and multispectral blending
 */

import * as THREE from 'three';
import { createRestorationTextures } from './material-pipeline.js';

export class RestorationScene {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth;
    this.height = container.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 0, 11);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.container.appendChild(this.renderer.domElement);

    // Textures & Material
    this.textures = createRestorationTextures();
    this.currentMode = 'visible'; // 'visible' | 'xray' | 'uv'

    this.initLighting();
    this.initPaintingMesh();
    this.initMouseTracking();

    window.addEventListener('resize', () => this.onResize());
  }

  initLighting() {
    // Soft baseline ambient light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    this.scene.add(this.ambientLight);

    // Dynamic Grazing Raking Light (Lampada da indagine radente)
    this.rakingLight = new THREE.PointLight(0xffe2ab, 3.5, 20);
    this.rakingLight.position.set(-3.5, -2.5, 0.45); // Low Z quota for grazing shadows!
    this.rakingLight.castShadow = true;
    this.rakingLight.shadow.mapSize.width = 1024;
    this.rakingLight.shadow.mapSize.height = 1024;
    this.rakingLight.shadow.camera.near = 0.1;
    this.rakingLight.shadow.camera.far = 25;
    this.rakingLight.shadow.bias = -0.001;

    // Small bulb mesh indicator
    const bulbGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfff0c4 });
    this.bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
    this.rakingLight.add(this.bulbMesh);

    this.scene.add(this.rakingLight);
  }

  initPaintingMesh() {
    // 8x8 units plane with high tessellation
    const geometry = new THREE.PlaneGeometry(7.2, 7.2, 256, 256);

    this.material = new THREE.MeshStandardMaterial({
      map: this.textures.visTexture,
      bumpMap: this.textures.bumpTexture,
      bumpScale: 0.08,
      normalMap: this.textures.normalTexture,
      normalScale: new THREE.Vector2(1.5, 1.5),
      roughness: 0.72,
      metalness: 0.08,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);

    // Deep wood backing frame
    const frameGeo = new THREE.BoxGeometry(7.4, 7.4, 0.4);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x18130e,
      roughness: 0.9,
    });
    this.frameMesh = new THREE.Mesh(frameGeo, frameMat);
    this.frameMesh.position.z = -0.22;
    this.scene.add(this.frameMesh);
  }

  initMouseTracking() {
    this.targetLampX = -3.0;
    this.targetLampY = -2.0;
    this.targetTiltX = 0;
    this.targetTiltY = 0;

    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      // Move raking light across painting surface
      this.targetLampX = normX * 4.2;
      this.targetLampY = normY * 4.2;

      // Subtle inspection tilt
      this.targetTiltY = normX * 0.12;
      this.targetTiltX = -normY * 0.12;
    });
  }

  setSpectralMode(mode) {
    this.currentMode = mode;

    if (mode === 'visible') {
      this.material.map = this.textures.visTexture;
      this.material.bumpScale = 0.08;
      this.rakingLight.color.setHex(0xffe2ab);
      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 0.25;
      this.bulbMesh.material.color.setHex(0xfff0c4);
    } else if (mode === 'xray') {
      this.material.map = this.textures.xrayTexture;
      this.material.bumpScale = 0.01; // X-Ray looks inside the support
      this.rakingLight.color.setHex(0xd0e8ff);
      this.ambientLight.color.setHex(0x8090a0);
      this.ambientLight.intensity = 0.65;
      this.bulbMesh.material.color.setHex(0xe0f0ff);
    } else if (mode === 'uv') {
      this.material.map = this.textures.uvTexture;
      this.material.bumpScale = 0.03;
      this.rakingLight.color.setHex(0x7b2cbf); // Wood's UV purple lamp
      this.ambientLight.color.setHex(0x18052e);
      this.ambientLight.intensity = 0.35;
      this.bulbMesh.material.color.setHex(0x9d4edd);
    }

    this.material.needsUpdate = true;
  }

  updateArtwork(sourceImage) {
    this.textures = createRestorationTextures(sourceImage);
    this.material.bumpMap = this.textures.bumpTexture;
    this.material.normalMap = this.textures.normalTexture;
    this.setSpectralMode(this.currentMode);
  }

  setLightAltitude(z) {
    this.rakingLight.position.z = z;
  }

  setLightIntensity(intensity) {
    this.rakingLight.intensity = intensity;
  }

  setImpastoRelief(scale) {
    this.material.bumpScale = scale;
    this.material.normalScale.set(scale * 18, scale * 18);
  }

  onResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  update() {
    // Smooth dampening of raking light motion
    this.rakingLight.position.x += (this.targetLampX - this.rakingLight.position.x) * 0.08;
    this.rakingLight.position.y += (this.targetLampY - this.rakingLight.position.y) * 0.08;

    // Smooth tilt
    this.mesh.rotation.x += (this.targetTiltX - this.mesh.rotation.x) * 0.06;
    this.mesh.rotation.y += (this.targetTiltY - this.mesh.rotation.y) * 0.06;
    this.frameMesh.rotation.x = this.mesh.rotation.x;
    this.frameMesh.rotation.y = this.mesh.rotation.y;

    this.renderer.render(this.scene, this.camera);
  }
}
