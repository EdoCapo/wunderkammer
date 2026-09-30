import { initRoomHeader } from '../../src/shared/navigation.js';
import { RestorationScene } from './scene-manager.js';
import {
  CURATED_MASTERPIECES,
  searchMuseumArtworks,
  loadCORSImage,
  createArtisticFallbackCanvas,
} from '../../src/shared/art-api.js';

// 1. Initialize Room Header
initRoomHeader({
  roomNumber: '04',
  roomTitle: 'Luce Radente & Tavolo 3D',
  badgeText: 'THREE.JS 3D',
  statusText: 'SCANNING',
});

const viewport = document.getElementById('threeViewport');
const scene = new RestorationScene(viewport);

// 2. Real Artwork Selector & Live Search
const presetList = document.getElementById('presetList');
const inputArtSearch = document.getElementById('inputArtSearch');
const btnSearchMuseum = document.getElementById('btnSearchMuseum');

function renderArtList(artworks) {
  presetList.innerHTML = '';
  artworks.forEach((art, idx) => {
    const btn = document.createElement('button');
    btn.className = `wk-preset-btn ${idx === 0 ? 'active' : ''}`;
    btn.innerHTML = `
      <span class="wk-preset-title">${art.title}</span>
      <span class="wk-preset-sub">${art.artist} (${art.year || ''})</span>
    `;

    btn.addEventListener('click', async () => {
      document.querySelectorAll('.wk-preset-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      await loadArtwork(art);
    });

    presetList.appendChild(btn);
  });
}

renderArtList(CURATED_MASTERPIECES);

async function loadArtwork(art) {
  try {
    const img = await loadCORSImage(art.url);
    scene.updateArtwork(img);
  } catch (err) {
    console.warn('Could not load image, using artistic canvas fallback:', err);
    const fallbackCanvas = createArtisticFallbackCanvas(1024, 1024, art.title, art.artist);
    scene.updateArtwork(fallbackCanvas);
  }
}

// Live Museum API Search
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
      loadArtwork(results[0]);
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

// 3. Diagnostic Reports
const reports = {
  visible: `<strong>Analisi in Luce Radente:</strong> L'angolo d'incidenza quasi orizzontale proietta ombre marcate sulle creste della materia pittorica. Si osserva un impasto generoso a base di biacca sulle zone frontali e una rete di craquelure fine a spirale.`,
  xray: `<strong>Indagine Radiografica a Raggi X:</strong> La penetrazione radioattiva svela il telaio in legno con traversa centrale e chiodi perimetrali in ferro battuto. Emerge un sensazionale <em>pentimento</em>: sotto il drappeggio cremisi, l'artista aveva originariamente dipinto una mano che stringeva un pugnale!`,
  uv: `<strong>Fluorescenza UV (Luce di Wood):</strong> La resina naturale di dammar ossidata produce una luminescenza verde-ambra diffusa. Le due aree opache e nere come pece sulla guancia e sul mantello rivelano ritocchi a vernice sintetica applicati durante un restauro non documentato del XX secolo.`,
};

const diagnosticReport = document.getElementById('diagnosticReport');

// 4. Spectral Mode Buttons
document.querySelectorAll('.wk-spectral-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.wk-spectral-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const mode = btn.dataset.mode;
    scene.setSpectralMode(mode);
    diagnosticReport.innerHTML = reports[mode];
  });
});

// 5. Sliders
const sliderZ = document.getElementById('sliderZ');
const sliderIntensity = document.getElementById('sliderIntensity');
const sliderImpasto = document.getElementById('sliderImpasto');

const valZ = document.getElementById('valZ');
const valIntensity = document.getElementById('valIntensity');
const valImpasto = document.getElementById('valImpasto');

sliderZ.addEventListener('input', (e) => {
  const z = parseFloat(e.target.value) / 100;
  valZ.textContent = z.toFixed(2);
  scene.setLightAltitude(z);
});

sliderIntensity.addEventListener('input', (e) => {
  const intensity = parseFloat(e.target.value) / 10;
  valIntensity.textContent = intensity.toFixed(1);
  scene.setLightIntensity(intensity);
});

sliderImpasto.addEventListener('input', (e) => {
  const impasto = parseFloat(e.target.value) / 100;
  valImpasto.textContent = impasto.toFixed(2);
  scene.setImpastoRelief(impasto);
});

// 6. Actions
document.getElementById('btnResetView').addEventListener('click', () => {
  scene.targetLampX = 0;
  scene.targetLampY = 0;
  scene.targetTiltX = 0;
  scene.targetTiltY = 0;
});

document.getElementById('btnExport').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `wunderkammer-restauro-3D-${scene.currentMode}.png`;
  link.href = scene.renderer.domElement.toDataURL('image/png');
  link.click();
});

// 7. 60 FPS Render Loop
function animate() {
  scene.update();
  requestAnimationFrame(animate);
}

animate();

// Initial load: Nighthawks (Hopper)
loadArtwork(CURATED_MASTERPIECES[0]);
