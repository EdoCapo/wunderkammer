import { initRoomHeader } from '../../src/shared/navigation.js';
import { computeGradients, drawVectorField } from './sobel-gradient.js';
import { ScanpathSimulator } from './scanpath-sim.js';

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

function resizeCanvases() {
  const rect = baseCanvas.parentElement.getBoundingClientRect();
  width = baseCanvas.width = vectorCanvas.width = scanpathCanvas.width = Math.floor(rect.width);
  height = baseCanvas.height = vectorCanvas.height = scanpathCanvas.height = Math.floor(rect.height);

  loadPreset('monalisa');
}

window.addEventListener('resize', resizeCanvases);

// 2. Preset Artworks Synthesizer (Generates classic tonal compositions)
function generateArtworkCanvas(type, w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');

  if (type === 'monalisa') {
    // Atmospheric Leonardo Chiaroscuro & Sfumato
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#2b362f');
    bgGrad.addColorStop(0.5, '#443b2b');
    bgGrad.addColorStop(1, '#1a1914');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Mountainous sfumato background
    ctx.fillStyle = '#3a473f';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.45);
    ctx.lineTo(w * 0.35, h * 0.32);
    ctx.lineTo(w * 0.6, h * 0.42);
    ctx.lineTo(w, h * 0.35);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // Dark pyramidal mantle
    ctx.fillStyle = '#1c1c1b';
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.28);
    ctx.lineTo(w * 0.15, h);
    ctx.lineTo(w * 0.85, h);
    ctx.closePath();
    ctx.fill();

    // Golden-brown chest / neckline
    ctx.fillStyle = '#9b764b';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.48, w * 0.18, h * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Luminous face oval (High saliency center)
    const faceGrad = ctx.createRadialGradient(w * 0.51, h * 0.31, 5, w * 0.5, h * 0.33, w * 0.13);
    faceGrad.addColorStop(0, '#ebd8b7');
    faceGrad.addColorStop(0.65, '#c9a87d');
    faceGrad.addColorStop(1, '#533e2c');
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.33, w * 0.11, h * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair curls framing
    ctx.fillStyle = '#221913';
    ctx.beginPath();
    ctx.ellipse(w * 0.38, h * 0.38, w * 0.05, h * 0.16, 0.2, 0, Math.PI * 2);
    ctx.ellipse(w * 0.62, h * 0.38, w * 0.05, h * 0.16, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Subtle dark eyes and iconic smile line
    ctx.fillStyle = '#3a251b';
    ctx.beginPath();
    ctx.arc(w * 0.46, h * 0.31, 4, 0, Math.PI * 2);
    ctx.arc(w * 0.55, h * 0.31, 4, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#4b3223';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(w * 0.505, h * 0.35, 12, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Crossed hands at base (Secondary saliency locus)
    const handGrad = ctx.createRadialGradient(w * 0.48, h * 0.78, 5, w * 0.48, h * 0.78, w * 0.14);
    handGrad.addColorStop(0, '#e5d0ae');
    handGrad.addColorStop(1, '#3b2f24');
    ctx.fillStyle = handGrad;
    ctx.beginPath();
    ctx.ellipse(w * 0.48, h * 0.78, w * 0.15, h * 0.08, -0.15, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === 'venere') {
    // Botticelli: High dynamic curves and golden flowing locks
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#7eb6d9');
    sky.addColorStop(0.7, '#c8e2ec');
    sky.addColorStop(1, '#3a7682');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Shell
    ctx.fillStyle = '#d89b6b';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.88, w * 0.36, h * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Venus Standing Figure (Contrapposto S-curve)
    ctx.fillStyle = '#fceada';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.52, w * 0.07, h * 0.28, 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Long Golden Flowing Hair lines
    ctx.strokeStyle = '#d49b27';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(w * 0.48, h * 0.26);
    ctx.bezierCurveTo(w * 0.65, h * 0.35, w * 0.3, h * 0.6, w * 0.62, h * 0.75);
    ctx.stroke();

    // Face
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.24, w * 0.065, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === 'vermeer') {
    // Vermeer: Pitch black background + ultramarine turban + luminous pearl
    ctx.fillStyle = '#0a0d0e';
    ctx.fillRect(0, 0, w, h);

    // Ochre Jacket
    ctx.fillStyle = '#a67c3b';
    ctx.beginPath();
    ctx.moveTo(w * 0.55, h * 0.5);
    ctx.lineTo(w * 0.2, h);
    ctx.lineTo(w * 0.85, h);
    ctx.closePath();
    ctx.fill();

    // Ultramarine Blue Turban
    ctx.fillStyle = '#1c3fa8';
    ctx.beginPath();
    ctx.ellipse(w * 0.52, h * 0.26, w * 0.16, h * 0.12, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Yellow trailing cloth
    ctx.fillStyle = '#deb335';
    ctx.beginPath();
    ctx.moveTo(w * 0.58, h * 0.28);
    ctx.lineTo(w * 0.68, h * 0.58);
    ctx.lineTo(w * 0.62, h * 0.6);
    ctx.closePath();
    ctx.fill();

    // Pale Glowing Face Turned
    ctx.fillStyle = '#f7e7d0';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.38, w * 0.11, h * 0.14, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Eye looking at observer (Tremendous Saliency)
    ctx.fillStyle = '#2e2621';
    ctx.beginPath();
    ctx.arc(w * 0.47, h * 0.36, 5, 0, Math.PI * 2);
    ctx.fill();

    // The Famous Pearl Earring (Specular reflection!)
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(w * 0.44, h * 0.47, 8, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  } else {
    // Piero della Francesca: Geometric symmetry & marble column light
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#5a8cb5');
    sky.addColorStop(1, '#a8cadf');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // River Jordan
    ctx.fillStyle = '#8ca89b';
    ctx.fillRect(w * 0.25, h * 0.7, w * 0.5, h * 0.3);

    // Central Christ figure (Pure vertical symmetry axis)
    ctx.fillStyle = '#e8d8c2';
    ctx.fillRect(w * 0.47, h * 0.28, w * 0.06, h * 0.55);

    // Tree of Knowledge (Strong vertical border)
    ctx.fillStyle = '#3a2717';
    ctx.fillRect(w * 0.22, h * 0.1, w * 0.04, h * 0.9);
    ctx.fillStyle = '#344e2b';
    ctx.beginPath();
    ctx.arc(w * 0.24, h * 0.18, w * 0.14, 0, Math.PI * 2);
    ctx.fill();

    // Dove of Holy Spirit
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.15, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  return c;
}

function processImage(sourceCanvasOrImg) {
  baseCtx.clearRect(0, 0, width, height);
  baseCtx.drawImage(sourceCanvasOrImg, 0, 0, width, height);

  currentImageData = baseCtx.getImageData(0, 0, width, height);
  currentGradients = computeGradients(currentImageData);

  scanpathSim = new ScanpathSimulator(currentImageData, currentGradients);
  scanpathSim.maxFixations = maxFixations;

  renderVectorLayer();
}

function loadPreset(key) {
  const artCanvas = generateArtworkCanvas(key, width, height);
  processImage(artCanvas);
}

// 3. Render Vector Field & Saliency Heatmap Layers
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

// 4. Main 60 FPS Animation Loop
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

// 5. Presets Click Events
document.querySelectorAll('.wk-preset-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.wk-preset-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    loadPreset(btn.dataset.preset);
  });
});

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
