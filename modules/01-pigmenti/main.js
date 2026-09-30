import { initRoomHeader } from '../../src/shared/navigation.js';
import {
  HISTORICAL_PIGMENTS,
  mixKubelkaMunk,
  renderCraquelureOverlay,
} from './pigment-engine.js';
import {
  CURATED_MASTERPIECES,
  loadCORSImage,
} from '../../src/shared/art-api.js';

// 1. Initialize Shared Room Header
initRoomHeader({
  roomNumber: '01',
  roomTitle: "L'Atelier dei Pigmenti Perduti",
  badgeText: 'KUBELKA-MUNK',
  statusText: 'ACTIVE',
});

// Canvas Setup
const paintCanvas = document.getElementById('paintCanvas');
const overlayCanvas = document.getElementById('ageOverlayCanvas');
const paintCtx = paintCanvas.getContext('2d');
const overlayCtx = overlayCanvas.getContext('2d');

let isDrawing = false;
let lastX = 0;
let lastY = 0;

let brushSize = 18;
let currentPigmentKey = 'cinabro';
let currentBrushColor = HISTORICAL_PIGMENTS.cinabro.baseColor;

// Track strokes: each stroke has { points: [{x, y}], color: string, pigmentKey: string, size: number }
let strokes = [];
let currentStroke = null;
let currentBaseImage = null;

// Environmental parameters
let stateTimeYears = 0;
let stateUV = 0.4;
let stateHumidity = 0.55;

// Mortar mixing state: { [pigmentId]: concentration }
const mortarState = {};
Object.keys(HISTORICAL_PIGMENTS).forEach((k) => (mortarState[k] = 0));
mortarState.cinabro = 80;
mortarState.biacca = 20;

function resizeCanvases() {
  const rect = paintCanvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  paintCanvas.width = overlayCanvas.width = rect.width;
  paintCanvas.height = overlayCanvas.height = rect.height;

  renderFullScene();
}

window.addEventListener('resize', resizeCanvases);

// 2. Setup Pigment Apothecary Selector UI
const pigmentGrid = document.getElementById('pigmentGrid');
const dossierName = document.getElementById('dossierName');
const dossierFormula = document.getElementById('dossierFormula');
const dossierToxicity = document.getElementById('dossierToxicity');
const dossierHistory = document.getElementById('dossierHistory');

Object.values(HISTORICAL_PIGMENTS).forEach((pigment) => {
  const btn = document.createElement('button');
  btn.className = `wk-pigment-btn ${pigment.id === currentPigmentKey ? 'active' : ''}`;
  btn.dataset.id = pigment.id;
  btn.innerHTML = `
    <div class="wk-pigment-swatch" style="background-color: ${pigment.baseColor}"></div>
    <span class="wk-pigment-label">${pigment.name.split(' ')[0]}</span>
  `;

  btn.addEventListener('click', () => {
    document.querySelectorAll('.wk-pigment-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectPigment(pigment.id);
  });

  pigmentGrid.appendChild(btn);
});

function selectPigment(id) {
  currentPigmentKey = id;
  const p = HISTORICAL_PIGMENTS[id];
  currentBrushColor = p.baseColor;

  dossierName.textContent = p.name;
  dossierFormula.textContent = p.formula;
  dossierToxicity.textContent = p.toxicity;
  dossierHistory.textContent = `${p.subname}. ${p.history}`;
}

// 3. Setup Mortar Controls
const mortarRatios = document.getElementById('mortarRatios');
const mixedSwatch = document.getElementById('mixedSwatch');
const mixedHexVal = document.getElementById('mixedHexVal');
const mixedKsVal = document.getElementById('mixedKsVal');

Object.values(HISTORICAL_PIGMENTS).forEach((pigment) => {
  const item = document.createElement('div');
  item.className = 'wk-ratio-item';
  item.innerHTML = `
    <span class="wk-ratio-name" title="${pigment.name}">${pigment.name.split(' ')[0]}</span>
    <input type="range" class="wk-slider" min="0" max="100" value="${mortarState[pigment.id]}" data-id="${pigment.id}" />
  `;

  const slider = item.querySelector('input');
  slider.addEventListener('input', (e) => {
    mortarState[pigment.id] = parseFloat(e.target.value);
    updateMortarMix();
  });

  mortarRatios.appendChild(item);
});

function updateMortarMix() {
  const components = Object.keys(mortarState)
    .filter((k) => mortarState[k] > 0)
    .map((k) => ({
      pigment: HISTORICAL_PIGMENTS[k],
      concentration: mortarState[k],
    }));

  const result = mixKubelkaMunk(components);
  mixedSwatch.style.backgroundColor = result.hex;
  mixedHexVal.textContent = result.hex.toUpperCase();

  const totalParts = components.reduce((acc, c) => acc + c.concentration, 0);
  mixedKsVal.textContent = `Parti: ${totalParts} | Formula: Σ(c·K)/Σ(c·S)`;
}

document.getElementById('btnApplyBrush').addEventListener('click', () => {
  const components = Object.keys(mortarState)
    .filter((k) => mortarState[k] > 0)
    .map((k) => ({
      pigment: HISTORICAL_PIGMENTS[k],
      concentration: mortarState[k],
    }));
  const result = mixKubelkaMunk(components);
  currentBrushColor = result.hex;
  currentPigmentKey = 'mixed';
});

// 4. Painting Canvas Interactions
paintCanvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  const rect = paintCanvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;

  currentStroke = {
    color: currentBrushColor,
    pigmentKey: currentPigmentKey,
    size: brushSize,
    points: [{ x: lastX, y: lastY }],
  };
  strokes.push(currentStroke);
  drawStrokeSegment(paintCtx, currentStroke, lastX, lastY, lastX, lastY);
});

paintCanvas.addEventListener('mousemove', (e) => {
  if (!isDrawing || !currentStroke) return;
  const rect = paintCanvas.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;

  currentStroke.points.push({ x: currentX, y: currentY });
  drawStrokeSegment(paintCtx, currentStroke, lastX, lastY, currentX, currentY);

  lastX = currentX;
  lastY = currentY;
});

window.addEventListener('mouseup', () => {
  if (isDrawing) {
    isDrawing = false;
    currentStroke = null;
  }
});

function drawStrokeSegment(ctx, stroke, x1, y1, x2, y2) {
  ctx.save();
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

// 5. Environmental Aging Sliders
const sliderTime = document.getElementById('sliderTime');
const sliderUV = document.getElementById('sliderUV');
const sliderHumidity = document.getElementById('sliderHumidity');
const sliderBrushSize = document.getElementById('sliderBrushSize');

const valTime = document.getElementById('valTime');
const valUV = document.getElementById('valUV');
const valHumidity = document.getElementById('valHumidity');
const valBrushSize = document.getElementById('valBrushSize');
const currentYearDisplay = document.getElementById('currentYearDisplay');

sliderTime.addEventListener('input', (e) => {
  stateTimeYears = parseInt(e.target.value);
  valTime.textContent = `${stateTimeYears} anni`;
  currentYearDisplay.textContent = `ANNO: +${stateTimeYears}`;
  renderFullScene();
});

sliderUV.addEventListener('input', (e) => {
  stateUV = parseInt(e.target.value) / 100;
  valUV.textContent = `${e.target.value}%`;
  renderFullScene();
});

sliderHumidity.addEventListener('input', (e) => {
  stateHumidity = parseInt(e.target.value) / 100;
  valHumidity.textContent = `${e.target.value}%`;
  renderFullScene();
});

sliderBrushSize.addEventListener('input', (e) => {
  brushSize = parseInt(e.target.value);
  valBrushSize.textContent = `${brushSize}px`;
});

// 6. Master Scene Rendering with Aging
function renderFullScene() {
  const w = paintCanvas.width;
  const h = paintCanvas.height;

  // Clear paint canvas with antique primed linen tint
  paintCtx.clearRect(0, 0, w, h);
  paintCtx.fillStyle = '#f4ede1';
  paintCtx.fillRect(0, 0, w, h);

  // If a real museum artwork is loaded, draw it as base
  if (currentBaseImage) {
    const imgW = currentBaseImage.width;
    const imgH = currentBaseImage.height;
    const scale = Math.min(w / imgW, h / imgH);
    const destW = imgW * scale;
    const destH = imgH * scale;
    const destX = (w - destW) / 2;
    const destY = (h - destH) / 2;
    paintCtx.drawImage(currentBaseImage, destX, destY, destW, destH);
  }

  // Redraw all strokes aged according to the temporal matrix
  strokes.forEach((stroke) => {
    let agedColor = stroke.color;

    if (stroke.pigmentKey && HISTORICAL_PIGMENTS[stroke.pigmentKey]) {
      const p = HISTORICAL_PIGMENTS[stroke.pigmentKey];
      const agedRgb = p.calcAgedColor(stateTimeYears, stateUV, stateHumidity);
      agedColor = `rgb(${agedRgb.r}, ${agedRgb.g}, ${agedRgb.b})`;
    }

    if (stroke.points.length > 1) {
      paintCtx.save();
      paintCtx.strokeStyle = agedColor;
      paintCtx.lineWidth = stroke.size;
      paintCtx.lineCap = 'round';
      paintCtx.lineJoin = 'round';

      paintCtx.beginPath();
      paintCtx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        paintCtx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      paintCtx.stroke();
      paintCtx.restore();
    }
  });

  // Render Craquelure & Varnish Discoloration on Overlay Canvas
  overlayCtx.clearRect(0, 0, w, h);

  if (stateTimeYears > 10) {
    const ageFactor = stateTimeYears / 500;
    // Varnish yellowing overlay
    overlayCtx.fillStyle = `rgba(145, 105, 45, ${ageFactor * 0.22})`;
    overlayCtx.fillRect(0, 0, w, h);

    // Voronoi crack network
    const crackDensity = ageFactor * (0.6 + 0.4 * stateHumidity);
    renderCraquelureOverlay(overlayCtx, w, h, crackDensity, ageFactor);
  }
}

// 7. Actions: Real Paintings & Canvas Reset
document.getElementById('btnNewCanvas').addEventListener('click', () => {
  strokes = [];
  currentBaseImage = null;
  renderFullScene();
});

let currentArtIndex = 0;
document.getElementById('btnLoadRealPainting').addEventListener('click', async () => {
  strokes = [];
  const art = CURATED_MASTERPIECES[currentArtIndex % CURATED_MASTERPIECES.length];
  currentArtIndex++;
  try {
    currentBaseImage = await loadCORSImage(art.url);
    renderFullScene();
  } catch (e) {
    loadRenaissanceBozzetto();
  }
});

document.getElementById('inputCustomPaint').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      strokes = [];
      currentBaseImage = img;
      renderFullScene();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

function loadRenaissanceBozzetto() {
  strokes = [];
  const w = paintCanvas.width;
  const h = paintCanvas.height;
  const cx = w / 2;
  const cy = h / 2;

  // Drape in Lead White and Mummy Brown underdrawing
  // Head oval & classic proportions
  const headR = Math.min(w, h) * 0.22;

  // Background mantle (Ultramarine Blue)
  strokes.push({
    color: HISTORICAL_PIGMENTS.oltremare.baseColor,
    pigmentKey: 'oltremare',
    size: 40,
    points: [
      { x: cx - headR * 1.6, y: cy + headR * 0.4 },
      { x: cx - headR * 1.8, y: cy + headR * 2.2 },
      { x: cx + headR * 1.8, y: cy + headR * 2.2 },
      { x: cx + headR * 1.6, y: cy + headR * 0.4 },
    ],
  });

  // Tunic (Vermilion Cinabro)
  strokes.push({
    color: HISTORICAL_PIGMENTS.cinabro.baseColor,
    pigmentKey: 'cinabro',
    size: 32,
    points: [
      { x: cx - headR * 0.9, y: cy + headR * 0.9 },
      { x: cx, y: cy + headR * 1.8 },
      { x: cx + headR * 0.9, y: cy + headR * 0.9 },
    ],
  });

  // Golden Halo (Indian Yellow)
  const haloPoints = [];
  for (let a = 0; a <= Math.PI * 2; a += 0.2) {
    haloPoints.push({
      x: cx + Math.cos(a) * (headR * 1.25),
      y: cy - headR * 0.2 + Math.sin(a) * (headR * 1.25),
    });
  }
  strokes.push({
    color: HISTORICAL_PIGMENTS.giallo_indiano.baseColor,
    pigmentKey: 'giallo_indiano',
    size: 14,
    points: haloPoints,
  });

  // Flesh base & Lead White highlights
  strokes.push({
    color: HISTORICAL_PIGMENTS.biacca.baseColor,
    pigmentKey: 'biacca',
    size: 26,
    points: [
      { x: cx, y: cy - headR * 0.3 },
      { x: cx, y: cy + headR * 0.5 },
    ],
  });

  // Contour details (Nero di Mummia)
  strokes.push({
    color: HISTORICAL_PIGMENTS.nero_mummia.baseColor,
    pigmentKey: 'nero_mummia',
    size: 5,
    points: [
      { x: cx - headR * 0.4, y: cy - headR * 0.1 },
      { x: cx - headR * 0.2, y: cy - headR * 0.1 },
    ],
  });
  strokes.push({
    color: HISTORICAL_PIGMENTS.nero_mummia.baseColor,
    pigmentKey: 'nero_mummia',
    size: 5,
    points: [
      { x: cx + headR * 0.2, y: cy - headR * 0.1 },
      { x: cx + headR * 0.4, y: cy - headR * 0.1 },
    ],
  });

  renderFullScene();
}

// Export canvas image
document.getElementById('btnExport').addEventListener('click', () => {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = paintCanvas.width;
  exportCanvas.height = paintCanvas.height;
  const expCtx = exportCanvas.getContext('2d');

  expCtx.drawImage(paintCanvas, 0, 0);
  expCtx.drawImage(overlayCanvas, 0, 0);

  // Add specimen watermark
  expCtx.fillStyle = 'rgba(9, 10, 12, 0.75)';
  expCtx.fillRect(16, exportCanvas.height - 44, 460, 32);
  expCtx.fillStyle = '#d4af37';
  expCtx.font = '13px "Space Mono", monospace';
  expCtx.fillText(`WUNDERKAMMER • STANZA 01 // ETÀ: +${stateTimeYears} ANNI // UV: ${Math.round(stateUV * 100)}%`, 24, exportCanvas.height - 24);

  const link = document.createElement('a');
  link.download = `wunderkammer-pigmenti-${stateTimeYears}anni.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
});

// Initial boot
resizeCanvases();
updateMortarMix();
loadRenaissanceBozzetto();
