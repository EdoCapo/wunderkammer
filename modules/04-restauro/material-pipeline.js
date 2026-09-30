/**
 * Wunderkammer — Room 04: Material Pipeline for 3D Restoration Table
 * Generates textures from real museum paintings or procedural masters:
 * 1. Visible Light (Full color classic oil painting)
 * 2. Displacement / Bump Height Map (Impasto thickness, canvas weave, cracks)
 * 3. Normal Map
 * 4. X-Ray Radiography (Sub-surface pentimenti, wooden stretcher bars, nails)
 * 5. UV Wood's Light (Aged dammar resin green glow & dark modern retouch patches)
 */

import * as THREE from 'three';

export function createRestorationTextures(sourceImage = null, width = 1024, height = 1024) {
  // 1. Visible Color Texture Canvas
  const visCanvas = document.createElement('canvas');
  visCanvas.width = width;
  visCanvas.height = height;
  const visCtx = visCanvas.getContext('2d');

  if (sourceImage) {
    // Fill dark gallery border
    visCtx.fillStyle = '#090a0c';
    visCtx.fillRect(0, 0, width, height);

    // Fit sourceImage centered with aspect ratio
    const imgW = sourceImage.width;
    const imgH = sourceImage.height;
    const scale = Math.min(width / imgW, height / imgH);
    const destW = imgW * scale;
    const destH = imgH * scale;
    const destX = (width - destW) / 2;
    const destY = (height - destH) / 2;

    visCtx.drawImage(sourceImage, destX, destY, destW, destH);
  } else {
    // Fallback classical chiaroscuro portrait
    const bgGrad = visCtx.createRadialGradient(width * 0.45, height * 0.4, 40, width * 0.5, height * 0.5, width * 0.6);
    bgGrad.addColorStop(0, '#3a2a1a');
    bgGrad.addColorStop(0.7, '#1c150e');
    bgGrad.addColorStop(1, '#0b0907');
    visCtx.fillStyle = bgGrad;
    visCtx.fillRect(0, 0, width, height);

    visCtx.fillStyle = '#8b1c14';
    visCtx.beginPath();
    visCtx.moveTo(width * 0.15, height * 0.95);
    visCtx.bezierCurveTo(width * 0.3, height * 0.55, width * 0.7, height * 0.55, width * 0.85, height * 0.95);
    visCtx.fill();

    const faceGrad = visCtx.createRadialGradient(width * 0.5, height * 0.38, 20, width * 0.5, height * 0.4, width * 0.22);
    faceGrad.addColorStop(0, '#f2d8be');
    faceGrad.addColorStop(0.65, '#cca47e');
    faceGrad.addColorStop(1, '#63442a');
    visCtx.fillStyle = faceGrad;
    visCtx.beginPath();
    visCtx.ellipse(width * 0.5, height * 0.4, width * 0.16, height * 0.21, 0, 0, Math.PI * 2);
    visCtx.fill();

    visCtx.fillStyle = '#fffdf7';
    visCtx.beginPath();
    visCtx.ellipse(width * 0.5, height * 0.32, 28, 14, 0, 0, Math.PI * 2);
    visCtx.ellipse(width * 0.5, height * 0.39, 6, 26, 0, 0, Math.PI * 2);
    visCtx.fill();
  }

  // 2. Displacement / Bump Height Map Canvas
  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = width;
  heightCanvas.height = height;
  const hCtx = heightCanvas.getContext('2d');

  hCtx.fillStyle = '#222222';
  hCtx.fillRect(0, 0, width, height);

  const imgData = hCtx.getImageData(0, 0, width, height);
  const pix = imgData.data;

  // Derive impasto thickness from luminancy & add linen weave noise
  const visData = visCtx.getImageData(0, 0, width, height).data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = visData[idx];
      const g = visData[idx + 1];
      const b = visData[idx + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Micro linen weave modulation
      const weaveX = Math.sin(x * 0.8) * 0.5 + 0.5;
      const weaveY = Math.cos(y * 0.8) * 0.5 + 0.5;
      const weave = (weaveX * weaveY) * 26;

      // Heavy impasto on highlights (Lead White has 3x thickness)
      const impasto = Math.pow(lum, 1.8) * 160;

      const totalH = Math.min(255, Math.floor(impasto + weave + 25));
      pix[idx] = totalH;
      pix[idx + 1] = totalH;
      pix[idx + 2] = totalH;
      pix[idx + 3] = 255;
    }
  }
  hCtx.putImageData(imgData, 0, 0);

  // 3. Normal Map Generation
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = width;
  normalCanvas.height = height;
  const nCtx = normalCanvas.getContext('2d');
  const nImgData = nCtx.createImageData(width, height);
  const nPix = nImgData.data;
  const hPix = imgData.data;

  const normalStrength = 2.4;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const leftH = hPix[(y * width + (x - 1)) * 4] / 255;
      const rightH = hPix[(y * width + (x + 1)) * 4] / 255;
      const topH = hPix[((y - 1) * width + x) * 4] / 255;
      const bottomH = hPix[((y + 1) * width + x) * 4] / 255;

      const dx = (leftH - rightH) * normalStrength;
      const dy = (topH - bottomH) * normalStrength;
      const dz = 1.0;

      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      nPix[idx] = Math.floor(((dx / len) * 0.5 + 0.5) * 255);
      nPix[idx + 1] = Math.floor(((dy / len) * 0.5 + 0.5) * 255);
      nPix[idx + 2] = Math.floor(((dz / len) * 0.5 + 0.5) * 255);
      nPix[idx + 3] = 255;
    }
  }
  nCtx.putImageData(nImgData, 0, 0);

  // 4. X-Ray Radiography Canvas (Sub-surface nails, stretcher wooden frame, pentimento figure)
  const xrayCanvas = document.createElement('canvas');
  xrayCanvas.width = width;
  xrayCanvas.height = height;
  const xCtx = xrayCanvas.getContext('2d');

  xCtx.fillStyle = '#101010';
  xCtx.fillRect(0, 0, width, height);

  // Wooden stretcher bars (Chassis) casting dark absorption bands
  xCtx.fillStyle = '#222222';
  const barThick = 65;
  xCtx.fillRect(0, 0, width, barThick);
  xCtx.fillRect(0, height - barThick, width, barThick);
  xCtx.fillRect(0, 0, barThick, height);
  xCtx.fillRect(width - barThick, 0, barThick, height);
  xCtx.fillRect(0, height * 0.5 - 25, width, 50);

  // Rusty iron nails holding canvas edges
  xCtx.fillStyle = '#ffffff';
  for (let i = 40; i < width - 40; i += 70) {
    xCtx.beginPath();
    xCtx.arc(i, 25, 6, 0, Math.PI * 2);
    xCtx.arc(i, height - 25, 6, 0, Math.PI * 2);
    xCtx.fill();
  }

  // Radiographic absorption from paint surface (Lead White is radio-opaque)
  xCtx.globalAlpha = 0.55;
  xCtx.drawImage(heightCanvas, 0, 0);
  xCtx.globalAlpha = 1.0;

  // Pentimento (Erased underlying sketch: a dagger hidden beneath the paint)
  xCtx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  xCtx.lineWidth = 14;
  xCtx.beginPath();
  xCtx.moveTo(width * 0.32, height * 0.68);
  xCtx.lineTo(width * 0.44, height * 0.54);
  xCtx.lineTo(width * 0.48, height * 0.57);
  xCtx.stroke();
  xCtx.lineWidth = 8;
  xCtx.beginPath();
  xCtx.moveTo(width * 0.44, height * 0.54);
  xCtx.lineTo(width * 0.64, height * 0.48);
  xCtx.stroke();

  // 5. UV Wood's Light Canvas
  const uvCanvas = document.createElement('canvas');
  uvCanvas.width = width;
  uvCanvas.height = height;
  const uvCtx = uvCanvas.getContext('2d');

  uvCtx.fillStyle = '#06030c';
  uvCtx.fillRect(0, 0, width, height);

  // Fluorescent green dammar glow modulated by surface
  const uvGrad = uvCtx.createRadialGradient(width * 0.5, height * 0.45, 60, width * 0.5, height * 0.5, width * 0.55);
  uvGrad.addColorStop(0, '#387842');
  uvGrad.addColorStop(0.65, '#204d2c');
  uvGrad.addColorStop(1, '#0e1f13');
  uvCtx.fillStyle = uvGrad;
  uvCtx.fillRect(0, 0, width, height);

  // Retouch patches (Pitch black absorption spots)
  uvCtx.fillStyle = '#020104';
  uvCtx.beginPath();
  uvCtx.ellipse(width * 0.42, height * 0.44, 28, 18, 0.3, 0, Math.PI * 2);
  uvCtx.fill();
  uvCtx.beginPath();
  uvCtx.ellipse(width * 0.66, height * 0.72, 38, 22, -0.4, 0, Math.PI * 2);
  uvCtx.fill();

  // Textures
  const visTexture = new THREE.CanvasTexture(visCanvas);
  const bumpTexture = new THREE.CanvasTexture(heightCanvas);
  const normalTexture = new THREE.CanvasTexture(normalCanvas);
  const xrayTexture = new THREE.CanvasTexture(xrayCanvas);
  const uvTexture = new THREE.CanvasTexture(uvCanvas);

  return {
    visTexture,
    bumpTexture,
    normalTexture,
    xrayTexture,
    uvTexture,
  };
}
