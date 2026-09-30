import { initRoomHeader } from '../../src/shared/navigation.js';
import { RestorationScene } from './scene-manager.js';

// 1. Initialize Room Header
initRoomHeader({
  roomNumber: '04',
  roomTitle: 'Luce Radente & Tavolo 3D',
  badgeText: 'THREE.JS 3D',
  statusText: 'SCANNING',
});

const viewport = document.getElementById('threeViewport');
const scene = new RestorationScene(viewport);

// 2. Diagnostic Reports
const reports = {
  visible: `<strong>Analisi in Luce Radente:</strong> L'angolo d'incidenza quasi orizzontale proietta ombre marcate sulle creste della materia pittorica. Si osserva un impasto generoso a base di biacca sulle zone frontali e una rete di craquelure fine a spirale.`,
  xray: `<strong>Indagine Radiografica a Raggi X:</strong> La penetrazione radioattiva svela il telaio in legno con traversa centrale e chiodi perimetrali in ferro battuto. Emerge un sensazionale <em>pentimento</em>: sotto il drappeggio cremisi, l'artista aveva originariamente dipinto una mano che stringeva un pugnale!`,
  uv: `<strong>Fluorescenza UV (Luce di Wood):</strong> La resina naturale di dammar ossidata produce una luminescenza verde-ambra diffusa. Le due aree opache e nere come pece sulla guancia e sul mantello rivelano ritocchi a vernice sintetica applicati durante un restauro non documentato del XX secolo.`,
};

const diagnosticReport = document.getElementById('diagnosticReport');

// 3. Spectral Mode Buttons
document.querySelectorAll('.wk-spectral-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.wk-spectral-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const mode = btn.dataset.mode;
    scene.setSpectralMode(mode);
    diagnosticReport.innerHTML = reports[mode];
  });
});

// 4. Sliders
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

// 5. Actions
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

// 6. 60 FPS Render Loop
function animate() {
  scene.update();
  requestAnimationFrame(animate);
}

animate();
