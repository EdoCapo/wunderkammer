import { initRoomHeader } from '../../src/shared/navigation.js';
import {
  fft2D,
  computePowerSpectrum,
  computeRadialBands,
  applySpatialFilter,
} from './fft2d.js';
import { FrequencyDroneSynth } from './audio-synth.js';

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

// 3. Classical Image Synthesizers (256x256)
function generateImage(type) {
  const c = document.createElement('canvas');
  c.width = N;
  c.height = N;
  const ctx = c.getContext('2d');

  if (type === 'piero') {
    // Piero della Francesca: Large, calm geometric masses, low spatial noise
    const sky = ctx.createLinearGradient(0, 0, 0, N);
    sky.addColorStop(0, '#5282a8');
    sky.addColorStop(1, '#a8cadf');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, N, N);

    // River horizontal band
    ctx.fillStyle = '#7a9686';
    ctx.fillRect(0, N * 0.7, N, N * 0.3);

    // Arch and temple pillar
    ctx.fillStyle = '#e4d5be';
    ctx.fillRect(N * 0.38, N * 0.2, N * 0.24, N * 0.6);

    // Vertical tree trunk
    ctx.fillStyle = '#2c1e13';
    ctx.fillRect(N * 0.12, 0, N * 0.08, N);

    // Symmetrical sphere / halo
    ctx.fillStyle = '#f0db8d';
    ctx.beginPath();
    ctx.arc(N * 0.5, N * 0.28, N * 0.12, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === 'pollock') {
    // Jackson Pollock Action Painting: Chaotic spatters, fractal micro-drips (High-frequency saturation!)
    ctx.fillStyle = '#1c1b18';
    ctx.fillRect(0, 0, N, N);

    // Hundreds of chaotic splatters and fine lines
    const colors = ['#f5f0e1', '#d4af37', '#1a3c6d', '#8b1c14', '#0d0d0d'];
    for (let i = 0; i < 280; i++) {
      ctx.strokeStyle = colors[i % colors.length];
      ctx.lineWidth = Math.random() * 2.5 + 0.5;

      ctx.beginPath();
      let x = Math.random() * N;
      let y = Math.random() * N;
      ctx.moveTo(x, y);

      for (let s = 0; s < 5; s++) {
        x += (Math.random() - 0.5) * 55;
        y += (Math.random() - 0.5) * 55;
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Splatter drops
      ctx.fillStyle = colors[(i + 1) % colors.length];
      ctx.beginPath();
      ctx.arc(Math.random() * N, Math.random() * N, Math.random() * 3 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

  } else {
    // Johannes Vermeer: Soft chiaroscuro & single bright specular highlight
    ctx.fillStyle = '#0a0d10';
    ctx.fillRect(0, 0, N, N);

    // Gentle torso
    ctx.fillStyle = '#a87834';
    ctx.beginPath();
    ctx.ellipse(N * 0.5, N * 0.75, N * 0.35, N * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Soft head oval
    const grad = ctx.createRadialGradient(N * 0.5, N * 0.4, 10, N * 0.5, N * 0.45, N * 0.22);
    grad.addColorStop(0, '#fcedd9');
    grad.addColorStop(1, '#3b2518');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(N * 0.5, N * 0.45, N * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Specular Pearl highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(N * 0.42, N * 0.55, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  return c;
}

// 4. Processing Pipeline: Image -> FFT 2D -> Audio & Filtering
function processArtwork(sourceCanvasOrImg) {
  origCtx.clearRect(0, 0, N, N);
  origCtx.drawImage(sourceCanvasOrImg, 0, 0, N, N);

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

// 5. Inverse FFT Reconstruction with Filter Cutoffs
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

// 6. UI: Presets
document.querySelectorAll('.wk-preset-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.wk-preset-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const art = generateImage(btn.dataset.preset);
    processArtwork(art);
  });
});

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

// Boot
const initialArt = generateImage('piero');
processArtwork(initialArt);
