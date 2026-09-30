/**
 * Wunderkammer — Room 05: 2D Fast Fourier Transform (FFT 2D) Engine
 * Implements Cooley-Tukey Radix-2 1D/2D FFT and 2D IFFT for spatial image filtering
 */

/**
 * 1D Radix-2 in-place Cooley-Tukey FFT
 * @param {Float64Array} re Real components (length must be power of 2)
 * @param {Float64Array} im Imaginary components
 * @param {boolean} inverse
 */
export function fft1D(re, im, inverse = false) {
  const n = re.length;
  if (n <= 1) return;

  // Bit reversal permutation
  let j = 0;
  for (let i = 0; i < n - 1; i++) {
    if (i < j) {
      let temp = re[i]; re[i] = re[j]; re[j] = temp;
      temp = im[i]; im[i] = im[j]; im[j] = temp;
    }
    let k = n >> 1;
    while (k <= j) {
      j -= k;
      k >>= 1;
    }
    j += k;
  }

  // Cooley-Tukey computation
  for (let len = 2; len <= n; len <<= 1) {
    const halfLen = len >> 1;
    const angle = (inverse ? 2 : -2) * Math.PI / len;
    const wStepRe = Math.cos(angle);
    const wStepIm = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let wRe = 1.0;
      let wIm = 0.0;
      for (let k = 0; k < halfLen; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + halfLen] * wRe - im[i + k + halfLen] * wIm;
        const vIm = re[i + k + halfLen] * wIm + im[i + k + halfLen] * wRe;

        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + halfLen] = uRe - vRe;
        im[i + k + halfLen] = uIm - vIm;

        const nextWRe = wRe * wStepRe - wIm * wStepIm;
        wIm = wRe * wStepIm + wIm * wStepRe;
        wRe = nextWRe;
      }
    }
  }

  if (inverse) {
    for (let i = 0; i < n; i++) {
      re[i] /= n;
      im[i] /= n;
    }
  }
}

/**
 * 2D FFT on N x N matrix (N must be power of 2, e.g. 128 or 256)
 */
export function fft2D(re, im, n, inverse = false) {
  // 1. Transform each row
  const rowRe = new Float64Array(n);
  const rowIm = new Float64Array(n);

  for (let y = 0; y < n; y++) {
    const rowOffset = y * n;
    for (let x = 0; x < n; x++) {
      rowRe[x] = re[rowOffset + x];
      rowIm[x] = im[rowOffset + x];
    }
    fft1D(rowRe, rowIm, inverse);
    for (let x = 0; x < n; x++) {
      re[rowOffset + x] = rowRe[x];
      im[rowOffset + x] = rowIm[x];
    }
  }

  // 2. Transform each column
  const colRe = new Float64Array(n);
  const colIm = new Float64Array(n);

  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      colRe[y] = re[y * n + x];
      colIm[y] = im[y * n + x];
    }
    fft1D(colRe, colIm, inverse);
    for (let y = 0; y < n; y++) {
      re[y * n + x] = colRe[y];
      im[y * n + x] = colIm[y];
    }
  }
}

/**
 * Shifts zero-frequency components to the center of the spectrum (fftshift)
 */
export function fftShift2D(matrix, n) {
  const shifted = new Float64Array(n * n);
  const half = n >> 1;

  for (let y = 0; y < n; y++) {
    const newY = (y + half) % n;
    for (let x = 0; x < n; x++) {
      const newX = (x + half) % n;
      shifted[newY * n + newX] = matrix[y * n + x];
    }
  }
  return shifted;
}

/**
 * Computes logarithmic power spectrum: S(u, v) = log(1 + sqrt(Re^2 + Im^2))
 */
export function computePowerSpectrum(re, im, n) {
  const size = n * n;
  const mag = new Float64Array(size);
  let maxVal = 0;

  for (let i = 0; i < size; i++) {
    const m = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
    const logVal = Math.log(1.0 + m);
    mag[i] = logVal;
    if (logVal > maxVal) maxVal = logVal;
  }

  const shifted = fftShift2D(mag, n);
  return { shifted, maxVal };
}

/**
 * Computes energy in 8 radial concentric frequency bands (r = sqrt(u^2 + v^2))
 * @returns {number[]} 8 normalized energy values [0..1]
 */
export function computeRadialBands(shiftedSpectrum, n) {
  const bands = new Float64Array(8);
  const counts = new Uint32Array(8);
  const center = n / 2;
  const maxR = n / 2;

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const dx = x - center;
      const dy = y - center;
      const r = Math.sqrt(dx * dx + dy * dy);

      if (r < maxR) {
        const bandIdx = Math.min(7, Math.floor((r / maxR) * 8));
        bands[bandIdx] += shiftedSpectrum[y * n + x];
        counts[bandIdx]++;
      }
    }
  }

  let maxBand = 0;
  for (let i = 0; i < 8; i++) {
    if (counts[i] > 0) bands[i] /= counts[i];
    if (bands[i] > maxBand) maxBand = bands[i];
  }

  if (maxBand > 0) {
    for (let i = 0; i < 8; i++) {
      bands[i] /= maxBand;
    }
  }

  return Array.from(bands);
}

/**
 * Applies low-pass and high-pass circular mask filters in frequency space
 */
export function applySpatialFilter(re, im, n, lowPassCutoff, highPassCutoff) {
  const center = n / 2;
  const maxR = n / 2;
  const rMin = (highPassCutoff / 100) * maxR;
  const rMax = (lowPassCutoff / 100) * maxR;

  // We operate on the shifted frequency domain then unshift
  const shiftedRe = fftShift2D(re, n);
  const shiftedIm = fftShift2D(im, n);

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const idx = y * n + x;
      const dx = x - center;
      const dy = y - center;
      const r = Math.sqrt(dx * dx + dy * dy);

      if (r < rMin || r > rMax) {
        shiftedRe[idx] = 0;
        shiftedIm[idx] = 0;
      }
    }
  }

  // Inverse shift
  const unshiftedRe = fftShift2D(shiftedRe, n);
  const unshiftedIm = fftShift2D(shiftedIm, n);

  for (let i = 0; i < n * n; i++) {
    re[i] = unshiftedRe[i];
    im[i] = unshiftedIm[i];
  }
}
