import { initRoomHeader } from '../../src/shared/navigation.js';
import { computeGradients, drawVectorField } from './sobel-gradient.js';
import { ScanpathSimulator } from './scanpath-sim.js';
import {
  CURATED_MASTERPIECES,
  searchMuseumArtworks,
  loadCORSImage,
} from '../../src/shared/art-api.js';

// 1. Initialize Room Header
initRoomHeader({
  roomNumber: '02',
  roomTitle: 'La Geometria Invisibile & Gestalt',
  badgeText: 'ITTI-KOCH SACCADES',
  statusText: 'SCANNING',
});

// Canvases
const baseCanvas = document.getElementById('baseCanvas');
const vectorCanvas = document.getElementById('vectorCanvas');
const scanpathCanvas = document.getElementById('scanpathCanvas');

const baseCtx = baseCanvas.getContext('2d');
const vectorCtx = vectorCanvas.getContext('2d');
const scanpathCtx = scanpathCanvas.getContext('2d');

let width = 0;
let height = 0;

let currentImageData = null;
let currentGradients = null;
let scanpathSim = null;

// Settings
let showImage = true;
let showHeatmap = false;
let showField = true;
let showScanpath = true;

let vectorStep = 14;
let vectorThreshold = 0.08;
let maxFixations = 18;

// Telemetry Elements
const statFixCount = document.getElementById('statFixCount');
const statAvgDwell = document.getElementById('statAvgDwell');
const presetList = document.getElementById('presetList');

function resizeCanvases() {
  const rect = baseCanvas.parentElement.getBoundingClientRect();
  width = baseCanvas.width = vectorCanvas.width = scanpathCanvas.width = Math.floor(rect.width);
  height = baseCanvas.height = vectorCanvas.height = scanpathCanvas.height = Math.floor(rect.height);

  // Load default Mona Lisa
  loadMasterpiece(CURATED_MASTERPIECES[0]);
}

window.addEventListener('resize', resizeCanvases);

// 2. Populate Real Masterpieces List
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

// Live Museum API Search
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
      alert(`Nessuna opera di pubblico dominio trovata per "${q}".`);
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

// 3. Process & Draw Image with Proper Aspect Ratio Fit
async function loadMasterpiece(art) {
  try {
    const img = await loadCORSImage(art.url);
    processImage(img);
  } catch (err) {
    console.warn('CORS or load failure, fallback to synthetic:', err);
    loadSyntheticFallback(art.id);
  }
}

function processImage(sourceImg) {
  baseCtx.clearRect(0, 0, width, height);

  // Black background
  baseCtx.fillStyle = '#090a0c';
  baseCtx.fillRect(0, 0, width, height);

  // Compute centered aspect-ratio fit
  const imgW = sourceImg.width;
  const imgH = sourceImg.height;
  const scale = Math.min(width / imgW, height / imgH);
  const destW = imgW * scale;
  const destH = imgH * scale;
  const destX = (width - destW) / 2;
  const destY = (height - destH) / 2;

  baseCtx.drawImage(sourceImg, destX, destY, destW, destH);

  currentImageData = baseCtx.getImageData(0, 0, width, height);
  currentGradients = computeGradients(currentImageData);

  scanpathSim = new ScanpathSimulator(currentImageData, currentGradients);
  scanpathSim.maxFixations = maxFixations;

  renderVectorLayer();
}

function loadSyntheticFallback(type) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');

  const g = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.4);
  g.addColorStop(0, '#ebd8b7');
  g.addColorStop(0.5, '#443b2b');
  g.addColorStop(1, '#1a1914');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#fceada';
  ctx.beginPath();
  ctx.arc(width / 2, height * 0.4, width * 0.18, 0, Math.PI * 2);
  ctx.fill();

  processImage(c);
}

// 4. Render Vector Field & Saliency Heatmap Layers
function renderVectorLayer() {
  vectorCtx.clearRect(0, 0, width, height);
  if (!currentGradients) return;

  // Heatmap Overlay
  if (showHeatmap && scanpathSim) {
    const imgData = vectorCtx.createImageData(width, height);
    const d = imgData.data;
    const sal = scanpathSim.saliencyMap;

    for (let i = 0, p = 0; i < sal.length; i++, p += 4) {
      const v = sal[i];
      // Thermal Palette: Blue -> Cyan -> Yellow -> Red
      d[p] = Math.min(255, Math.floor(v * 2.2 * 255)); // Red
      d[p + 1] = Math.min(255, Math.floor(Math.sin(v * Math.PI) * 255)); // Green
      d[p + 2] = Math.min(255, Math.floor((1 - v) * 255)); // Blue
      d[p + 3] = Math.floor(v * 160); // Alpha
    }

    vectorCtx.putImageData(imgData, 0, 0);
  }

  // Force Field Vectors
  if (showField) {
    drawVectorField(vectorCtx, currentGradients, vectorStep, 10, vectorThreshold);
  }
}

// 5. Main 60 FPS Animation Loop
let frame = 0;

function loop() {
  frame++;

  if (scanpathSim) {
    scanpathSim.update();

    scanpathCtx.clearRect(0, 0, width, height);
    if (showScanpath) {
      scanpathSim.render(scanpathCtx);
    }

    // Telemetry updates
    if (frame % 15 === 0) {
      statFixCount.textContent = scanpathSim.fixations.length;
      if (scanpathSim.fixations.length > 0) {
        const avgFrames =
          scanpathSim.fixations.reduce((acc, f) => acc + f.duration, 0) / scanpathSim.fixations.length;
        statAvgDwell.textContent = `${Math.round(avgFrames * 16.6)} ms`;
      }
    }
  }

  requestAnimationFrame(loop);
}

loop();

// 6. Layer Checkboxes
const chkImage = document.getElementById('chkImage');
const chkHeatmap = document.getElementById('chkHeatmap');
const chkField = document.getElementById('chkField');
const chkScanpath = document.getElementById('chkScanpath');

chkImage.addEventListener('change', (e) => {
  showImage = e.target.checked;
  baseCanvas.style.opacity = showImage ? '1' : '0.12';
});

chkHeatmap.addEventListener('change', (e) => {
  showHeatmap = e.target.checked;
  renderVectorLayer();
});

chkField.addEventListener('change', (e) => {
  showField = e.target.checked;
  renderVectorLayer();
});

chkScanpath.addEventListener('change', (e) => {
  showScanpath = e.target.checked;
});

// 7. Sliders
const sliderDensity = document.getElementById('sliderDensity');
const sliderThreshold = document.getElementById('sliderThreshold');
const sliderMaxFix = document.getElementById('sliderMaxFix');

const valDensity = document.getElementById('valDensity');
const valThreshold = document.getElementById('valThreshold');
const valMaxFix = document.getElementById('valMaxFix');

sliderDensity.addEventListener('input', (e) => {
  vectorStep = parseInt(e.target.value);
  valDensity.textContent = `${vectorStep}px`;
  renderVectorLayer();
});

sliderThreshold.addEventListener('input', (e) => {
  vectorThreshold = parseInt(e.target.value) / 100;
  valThreshold.textContent = vectorThreshold.toFixed(2);
  renderVectorLayer();
});

sliderMaxFix.addEventListener('input', (e) => {
  maxFixations = parseInt(e.target.value);
  valMaxFix.textContent = `${maxFixations}`;
  if (scanpathSim) scanpathSim.maxFixations = maxFixations;
});

// 8. Buttons: Reset Scanpath & Custom File Upload
document.getElementById('btnResetScanpath').addEventListener('click', () => {
  if (scanpathSim) scanpathSim.reset();
});

document.getElementById('inputCustomImage').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      document.querySelectorAll('.wk-preset-btn').forEach((b) => b.classList.remove('active'));
      processImage(img);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Export combined specimen
document.getElementById('btnExportSpecimen').addEventListener('click', () => {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = width;
  exportCanvas.height = height;
  const expCtx = exportCanvas.getContext('2d');

  expCtx.drawImage(baseCanvas, 0, 0);
  expCtx.drawImage(vectorCanvas, 0, 0);
  expCtx.drawImage(scanpathCanvas, 0, 0);

  // Placard
  expCtx.fillStyle = 'rgba(9, 10, 12, 0.8)';
  expCtx.fillRect(16, height - 44, 480, 32);
  expCtx.fillStyle = '#d4af37';
  expCtx.font = '13px "Space Mono", monospace';
  expCtx.fillText(`WUNDERKAMMER • STANZA 02 // SCHARR TENSORS & ITTI-KOCH SCANPATH`, 24, height - 24);

  const link = document.createElement('a');
  link.download = `wunderkammer-gestalt-scanpath.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
});

// Boot
resizeCanvases();
