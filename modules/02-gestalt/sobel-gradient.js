/**
 * Wunderkammer — Room 02: Gestalt & Vector Field Analysis
 * Computes luminance, Scharr/Sobel convolution, gradient magnitude and isoline orientations
 */

import { getLuminance } from '../../src/shared/math-utils.js';

// Scharr 3x3 Kernels (superior rotational symmetry compared to standard Sobel)
const SCHARR_X = [
  -3, 0, 3,
  -10, 0, 10,
  -3, 0, 3,
];

const SCHARR_Y = [
  -3, -10, -3,
   0,   0,  0,
   3,  10,  3,
];

/**
 * Extracts luminance and Scharr gradients from an ImageData object
 * @param {ImageData} imageData 
 * @returns {{ width: number, height: number, luminance: Float32Array, gx: Float32Array, gy: Float32Array, magnitude: Float32Array, orientation: Float32Array }}
 */
export function computeGradients(imageData) {
  const { width, height, data } = imageData;
  const size = width * height;

  const luminance = new Float32Array(size);
  const gx = new Float32Array(size);
  const gy = new Float32Array(size);
  const magnitude = new Float32Array(size);
  const orientation = new Float32Array(size); // Isoline orientation in radians

  // 1. Convert to Luminance Y = 0.299R + 0.587G + 0.114B (normalized 0..1)
  for (let i = 0, p = 0; i < size; i++, p += 4) {
    luminance[i] = getLuminance(data[p], data[p + 1], data[p + 2]) / 255.0;
  }

  // 2. Convolve with Scharr 3x3
  let maxMag = 0;
  for (let y = 1; y < height - 1; y++) {
    const yOffset = y * width;
    for (let x = 1; x < width - 1; x++) {
      const idx = yOffset + x;

      // 3x3 neighborhood
      const p00 = luminance[idx - width - 1];
      const p10 = luminance[idx - width];
      const p20 = luminance[idx - width + 1];

      const p01 = luminance[idx - 1];
      const p21 = luminance[idx + 1];

      const p02 = luminance[idx + width - 1];
      const p12 = luminance[idx + width];
      const p22 = luminance[idx + width + 1];

      // Gx convolution
      const valX =
        SCHARR_X[0] * p00 + SCHARR_X[2] * p20 +
        SCHARR_X[3] * p01 + SCHARR_X[5] * p21 +
        SCHARR_X[6] * p02 + SCHARR_X[8] * p22;

      // Gy convolution
      const valY =
        SCHARR_Y[0] * p00 + SCHARR_Y[1] * p10 + SCHARR_Y[2] * p20 +
        SCHARR_Y[6] * p02 + SCHARR_Y[7] * p12 + SCHARR_Y[8] * p22;

      gx[idx] = valX;
      gy[idx] = valY;

      const mag = Math.sqrt(valX * valX + valY * valY);
      magnitude[idx] = mag;
      if (mag > maxMag) maxMag = mag;

      // Isoline compositive orientation: theta = atan2(Gy, Gx) + pi/2
      orientation[idx] = Math.atan2(valY, valX) + Math.PI / 2;
    }
  }

  // Normalize magnitude to 0..1
  if (maxMag > 0) {
    for (let i = 0; i < size; i++) {
      magnitude[i] /= maxMag;
    }
  }

  return { width, height, luminance, gx, gy, magnitude, orientation };
}

/**
 * Draws the vector flow field lines on a canvas context
 */
export function drawVectorField(ctx, gradientData, step = 14, scale = 10, minThreshold = 0.05) {
  const { width, height, magnitude, orientation } = gradientData;

  ctx.save();
  ctx.lineWidth = 1.2;

  for (let y = step; y < height - step; y += step) {
    const rowOffset = y * width;
    for (let x = step; x < width - step; x += step) {
      const idx = rowOffset + x;
      const mag = magnitude[idx];
      if (mag < minThreshold) continue;

      const angle = orientation[idx];
      const length = Math.min(step * 0.9, mag * scale);

      const dx = Math.cos(angle) * (length / 2);
      const dy = Math.sin(angle) * (length / 2);

      // Color based on force magnitude (golden gradient)
      const alpha = Math.min(0.9, mag * 1.5 + 0.15);
      ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;

      ctx.beginPath();
      ctx.moveTo(x - dx, y - dy);
      ctx.lineTo(x + dx, y + dy);
      ctx.stroke();

      // Tiny focal circle on directional tip
      ctx.fillStyle = `rgba(0, 229, 255, ${alpha * 0.7})`;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
