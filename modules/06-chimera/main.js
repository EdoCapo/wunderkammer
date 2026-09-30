import { initRoomHeader } from '../../src/shared/navigation.js';
import { fetchMetArtPiece } from './met-api-client.js';
import { loadImage, compositeChimera } from './image-slicer.js';

// 1. Initialize Room Header
initRoomHeader({
  roomNumber: '06',
  roomTitle: 'Il Chimera Museum',
  badgeText: 'CADAVRE EXQUIS // MET NY',
  statusText: 'CURATING',
});

const canvas = document.getElementById('chimeraCanvas');
const loadingOverlay = document.getElementById('loadingOverlay');

let currentTopPiece = null;
let currentMidPiece = null;
let currentBotPiece = null;

let loadedTopImg = null;
let loadedMidImg = null;
let loadedBotImg = null;

let harmonization = 0.35;
let fallbackCounter = 0;

// Locks
const lockTop = document.getElementById('lockTop');
const lockMid = document.getElementById('lockMid');
const lockBot = document.getElementById('lockBot');

// Placard DOM Elements
const topTitle = document.getElementById('topTitle');
const topArtist = document.getElementById('topArtist');
const topLink = document.getElementById('topLink');

const midTitle = document.getElementById('midTitle');
const midArtist = document.getElementById('midArtist');
const midLink = document.getElementById('midLink');

const botTitle = document.getElementById('botTitle');
const botArtist = document.getElementById('botArtist');
const botLink = document.getElementById('botLink');

async function generateChimera() {
  loadingOverlay.classList.add('active');
  fallbackCounter++;

  try {
    // 1. Fetch parts that are not locked
    const topPromise = lockTop.checked && currentTopPiece
      ? Promise.resolve(currentTopPiece)
      : fetchMetArtPiece('sky', fallbackCounter);

    const midPromise = lockMid.checked && currentMidPiece
      ? Promise.resolve(currentMidPiece)
      : fetchMetArtPiece('portrait', fallbackCounter);

    const botPromise = lockBot.checked && currentBotPiece
      ? Promise.resolve(currentBotPiece)
      : fetchMetArtPiece('base', fallbackCounter);

    const [newTop, newMid, newBot] = await Promise.all([topPromise, midPromise, botPromise]);

    currentTopPiece = newTop;
    currentMidPiece = newMid;
    currentBotPiece = newBot;

    // 2. Load images into memory
    const [topImg, midImg, botImg] = await Promise.all([
      loadImage(currentTopPiece.image),
      loadImage(currentMidPiece.image),
      loadImage(currentBotPiece.image),
    ]);

    loadedTopImg = topImg;
    loadedMidImg = midImg;
    loadedBotImg = botImg;

    // 3. Composite onto canvas
    renderComposite();

    // 4. Update Placard
    updatePlacard();
  } catch (err) {
    console.error('Chimera generation error:', err);
  } finally {
    loadingOverlay.classList.remove('active');
  }
}

function renderComposite() {
  if (!loadedTopImg || !loadedMidImg || !loadedBotImg) return;
  compositeChimera(canvas, loadedTopImg, loadedMidImg, loadedBotImg, {
    harmonization,
  });
}

function updatePlacard() {
  if (currentTopPiece) {
    topTitle.textContent = currentTopPiece.title;
    topArtist.textContent = `${currentTopPiece.artist} • ${currentTopPiece.date}`;
    topLink.href = currentTopPiece.link;
  }

  if (currentMidPiece) {
    midTitle.textContent = currentMidPiece.title;
    midArtist.textContent = `${currentMidPiece.artist} • ${currentMidPiece.date}`;
    midLink.href = currentMidPiece.link;
  }

  if (currentBotPiece) {
    botTitle.textContent = currentBotPiece.title;
    botArtist.textContent = `${currentBotPiece.artist} • ${currentBotPiece.date}`;
    botLink.href = currentBotPiece.link;
  }
}

// Sliders & Events
const sliderHarmonize = document.getElementById('sliderHarmonize');
const valHarmonize = document.getElementById('valHarmonize');

sliderHarmonize.addEventListener('input', (e) => {
  harmonization = parseInt(e.target.value) / 100;
  valHarmonize.textContent = `${e.target.value}%`;
  renderComposite();
});

document.getElementById('btnGenerate').addEventListener('click', () => {
  generateChimera();
});

// Export composite with full museum placard
document.getElementById('btnExport').addEventListener('click', () => {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height + 120;
  const expCtx = exportCanvas.getContext('2d');

  // Background
  expCtx.fillStyle = '#0e1014';
  expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  // Draw Chimera
  expCtx.drawImage(canvas, 0, 0);

  // Draw Curatorial Placard at bottom
  expCtx.fillStyle = 'rgba(212, 175, 55, 0.15)';
  expCtx.fillRect(20, canvas.height + 15, exportCanvas.width - 40, 1);

  expCtx.fillStyle = '#d4af37';
  expCtx.font = 'bold 13px "Cinzel", serif';
  expCtx.fillText('WUNDERKAMMER • IL CHIMERA MUSEUM (CADAVRE EXQUIS)', 24, canvas.height + 38);

  expCtx.fillStyle = '#8e96a4';
  expCtx.font = '11px "Space Mono", monospace';
  expCtx.fillText(
    `CIELO: ${currentTopPiece ? currentTopPiece.title.slice(0, 32) : ''}... // CORPO: ${currentMidPiece ? currentMidPiece.title.slice(0, 32) : ''}...`,
    24,
    canvas.height + 62
  );
  expCtx.fillText('COLLEZIONI AD ACCESSO APERTO • METROPOLITAN MUSEUM OF ART, NY', 24, canvas.height + 84);

  const link = document.createElement('a');
  link.download = `wunderkammer-chimera-museum.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
});

// Initial generation
generateChimera();
