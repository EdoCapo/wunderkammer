import { initRoomHeader } from '../../src/shared/navigation.js';
import {
  fft2D,
  computePowerSpectrum,
  computeRadialBands,
  applySpatialFilter,
} from './fft2d.js';
import { FrequencyDroneSynth } from './audio-synth.js';
import {
  CURATED_MASTERPIECES,
  searchMuseumArtworks,
  loadCORSImage,
} from '../../src/shared/art-api.js';

// 1. Initialize Room Header
initRoomHeader({
  roomNumber: '05',
  roomTitle: "La Frequenza dell'Arte",
  badgeText: 'FFT 2D & WEB AUDIO',
  statusText: 'TUNED',
});

const N = 256; // Matrix resolution (2^8)

const origCanvas = document.getElementById('origCanvas');
const fftCanvas = document.getElementById('fftCanvas');
const ringsCanvas = document.getElementById('ringsCanvas');
const reconstructCanvas = document.getElementById('reconstructCanvas');

const origCtx = origCanvas.getContext('2d');
const fftCtx = fftCanvas.getContext('2d');
const ringsCtx = ringsCanvas.getContext('2d');
const recCtx = reconstructCanvas.getContext('2d');

const synth = new FrequencyDroneSynth();

// Real and Imaginary components
let reOrig = new Float64Array(N * N);
let imOrig = new Float64Array(N * N);
let currentSpectrum = null;
let currentBands = new Array(8).fill(0);

// Filter cutoffs
let lowPassCutoff = 100; // 10% to 100%
let highPassCutoff = 0;   // 0% to 90%

// 2. Setup 8 Radial Bands Meter UI
const bandsMeters = document.getElementById('bandsMeters');
const bandRows = [];
const bandNames = [
  'Banda 0 (Sub-Bass 55Hz)',
  'Banda 1 (Ottava 110Hz)',
  'Banda 2 (Quinta 165Hz)',
  'Banda 3 (Modale 220Hz)',
  'Banda 4 (Terza 277Hz)',
  'Banda 5 (Armonica 330Hz)',
  'Banda 6 (Squillante 440Hz)',
  'Banda 7 (Rumore Caos 2.4kHz)',
];

for (let i = 0; i < 8; i++) {
  const row = document.createElement('div');
  row.className = 'wk-band-row';
  row.innerHTML = `
    <span class="wk-band-label">${bandNames[i].split(' ')[0]} ${bandNames[i].split(' ')[1]}</span>
    <div class="wk-meter-track">
      <div class="wk-meter-fill" id="meterFill${i}"></div>
    </div>
  `;
  bandsMeters.appendChild(row);
  bandRows.push(row.querySelector(`#meterFill${i}`));
}

// 3. Populate Real Masterpieces & Live Search
const presetList = document.getElementById('presetList');

function renderArtList(artworks) {
  presetList.innerHTML = '';
  artworks.forEach((art, idx) => {
    const btn = document.createElement('button');
    btn.className = `wk-preset-btn ${idx === 0 ? 'active' : ''}`;
    btn.innerHTML = `
      <span class="wk-preset-title">${art.title}</span>
      <span class="wk-preset-sub">${art.artist} (${art.year || ''})</span>
    `;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.wk-preset-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      loadMasterpiece(art);
    });

    presetList.appendChild(btn);
  });
}

renderArtList(CURATED_MASTERPIECES);

// Live Search
const inputArtSearch = document.getElementById('inputArtSearch');
const btnSearchMuseum = document.getElementById('btnSearchMuseum');

async function handleSearch() {
  const q = inputArtSearch.value.trim();
  if (!q) {
    renderArtList(CURATED_MASTERPIECES);
    return;
  }

  btnSearchMuseum.textContent = '...';
  try {
    const results = await searchMuseumArtworks(q, 8);
    if (results.length > 0) {
      renderArtList(results);
      loadMasterpiece(results[0]);
    } else {
      alert(`Nessuna opera trovata per "${q}".`);
    }
  } catch (err) {
    console.error('Search error:', err);
  } finally {
    btnSearchMuseum.textContent = 'Cerca';
  }
}

btnSearchMuseum.addEventListener('click', handleSearch);
inputArtSearch.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});

// 4. Load & Process Real Images
async function loadMasterpiece(art) {
  try {
    const img = await loadCORSImage(art.url);
    processArtwork(img);
  } catch (err) {
    console.warn('CORS or load failure, using synthetic pattern:', err);
    processArtwork(generateFallbackCanvas());
  }
}

function generateFallbackCanvas() {
  const c = document.createElement('canvas');
  c.width = N;
  c.height = N;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1c1b18';
  ctx.fillRect(0, 0, N, N);
  ctx.fillStyle = '#d4af37';
  ctx.beginPath();
  ctx.arc(N / 2, N / 2, N * 0.3, 0, Math.PI * 2);
  ctx.fill();
  return c;
}

// 5. Processing Pipeline: Image -> FFT 2D -> Audio & Filtering
function processArtwork(sourceImg) {
  origCtx.clearRect(0, 0, N, N);
  origCtx.fillStyle = '#090a0c';
  origCtx.fillRect(0, 0, N, N);

  // Preserve aspect ratio inside 256x256
  const imgW = sourceImg.width;
  const imgH = sourceImg.height;
  const scale = Math.min(N / imgW, N / imgH);
  const destW = imgW * scale;
  const destH = imgH * scale;
  const destX = (N - destW) / 2;
  const destY = (N - destH) / 2;

  origCtx.drawImage(sourceImg, destX, destY, destW, destH);

  // Extract grayscale data into real buffer
  const imgData = origCtx.getImageData(0, 0, N, N);
  const data = imgData.data;

  for (let i = 0, p = 0; i < N * N; i++, p += 4) {
    const lum = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
    reOrig[i] = lum;
    imOrig[i] = 0.0;
  }

  // Compute 2D Forward FFT
  const reFft = new Float64Array(reOrig);
  const imFft = new Float64Array(imOrig);
  fft2D(reFft, imFft, N, false);

  // Compute Log Power Spectrum
  const { shifted, maxVal } = computePowerSpectrum(reFft, imFft, N);
  currentSpectrum = shifted;

  // Render Power Spectrum to fftCanvas
  const spectrumImgData = fftCtx.createImageData(N, N);
  const sData = spectrumImgData.data;

  for (let i = 0, p = 0; i < N * N; i++, p += 4) {
    const norm = maxVal > 0 ? shifted[i] / maxVal : 0;
    // Golden-Cyan false-color spectral map
    sData[p] = Math.min(255, Math.floor(Math.pow(norm, 1.2) * 255 * 1.1));     // R (Gold)
    sData[p + 1] = Math.min(255, Math.floor(Math.pow(norm, 1.4) * 220));       // G
    sData[p + 2] = Math.min(255, Math.floor(Math.sin(norm * Math.PI) * 255));  // B (Cyan glow)
    sData[p + 3] = 255;
  }
  fftCtx.putImageData(spectrumImgData, 0, 0);

  // Compute 8 radial energy bands
  currentBands = computeRadialBands(shifted, N);
  updateMeters(currentBands);
  synth.updateBands(currentBands);

  // Draw 8 concentric overlay rings
  drawFrequencyRings();

  // Apply spatial filters and reconstruct with inverse FFT
  reconstructFilteredImage();
}

function drawFrequencyRings() {
  ringsCtx.clearRect(0, 0, N, N);
  const cx = N / 2;
  const cy = N / 2;
  const maxR = N / 2;

  for (let i = 1; i <= 8; i++) {
    const r = (i / 8) * maxR;
    const energy = currentBands[i - 1] || 0;

    ringsCtx.beginPath();
    ringsCtx.arc(cx, cy, r, 0, Math.PI * 2);
    ringsCtx.strokeStyle = `rgba(0, 229, 255, ${0.15 + energy * 0.65})`;
    ringsCtx.lineWidth = 1 + energy * 1.5;
    ringsCtx.setLineDash([2, 5]);
    ringsCtx.stroke();
  }
}

function updateMeters(bands) {
  for (let i = 0; i < 8; i++) {
    const energy = bands[i] || 0;
    bandRows[i].style.width = `${Math.min(100, Math.round(energy * 100))}%`;
  }
}

// 6. Inverse FFT Reconstruction with Filter Cutoffs
function reconstructFilteredImage() {
  const reRec = new Float64Array(reOrig);
  const imRec = new Float64Array(imOrig);

  // Forward FFT
  fft2D(reRec, imRec, N, false);

  // Frequency Mask Filter
  applySpatialFilter(reRec, imRec, N, lowPassCutoff, highPassCutoff);

  // Inverse FFT (2D IFFT)
  fft2D(reRec, imRec, N, true);

  // Render to reconstructCanvas
  const recData = recCtx.createImageData(N, N);
  const d = recData.data;

  for (let i = 0, p = 0; i < N * N; i++, p += 4) {
    const val = Math.min(255, Math.max(0, Math.round(reRec[i])));
    d[p] = val;
    d[p + 1] = val;
    d[p + 2] = val;
    d[p + 3] = 255;
  }
  recCtx.putImageData(recData, 0, 0);
}

// 7. UI: Sliders
const sliderLowPass = document.getElementById('sliderLowPass');
const sliderHighPass = document.getElementById('sliderHighPass');
const sliderVolume = document.getElementById('sliderVolume');

const valLowPass = document.getElementById('valLowPass');
const valHighPass = document.getElementById('valHighPass');
const valVolume = document.getElementById('valVolume');

sliderLowPass.addEventListener('input', (e) => {
  lowPassCutoff = parseInt(e.target.value);
  valLowPass.textContent = `${lowPassCutoff}%`;
  reconstructFilteredImage();
});

sliderHighPass.addEventListener('input', (e) => {
  highPassCutoff = parseInt(e.target.value);
  valHighPass.textContent = `${highPassCutoff}%`;
  reconstructFilteredImage();
});

sliderVolume.addEventListener('input', (e) => {
  const vol = parseInt(e.target.value) / 100;
  valVolume.textContent = `${e.target.value}%`;
  synth.setMasterVolume(vol);
});

// 8. Audio Toggle
const btnAudioToggle = document.getElementById('btnAudioToggle');
const audioIcon = document.getElementById('audioIcon');
const audioLabel = document.getElementById('audioLabel');

btnAudioToggle.addEventListener('click', () => {
  const isPlaying = synth.toggle();
  if (isPlaying) {
    audioIcon.textContent = '⏹';
    audioLabel.textContent = 'Arresta Drone Sinestesico';
    btnAudioToggle.classList.add('wk-btn-gold');
    btnAudioToggle.classList.remove('wk-btn-cyan');
    synth.updateBands(currentBands);
  } else {
    audioIcon.textContent = '▶';
    audioLabel.textContent = 'Attiva Drone Sinestesico';
    btnAudioToggle.classList.remove('wk-btn-gold');
    btnAudioToggle.classList.add('wk-btn-cyan');
  }
});

// 9. Custom Image Upload
document.getElementById('inputCustomImage').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      document.querySelectorAll('.wk-preset-btn').forEach((b) => b.classList.remove('active'));
      processArtwork(img);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Export Spectrum
document.getElementById('btnExport').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `wunderkammer-fft2d-spectrum.png`;
  link.href = fftCanvas.toDataURL('image/png');
  link.click();
});

// Initial load: Monna Lisa!
loadMasterpiece(CURATED_MASTERPIECES[0]);
