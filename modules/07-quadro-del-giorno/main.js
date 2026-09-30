import { initRoomHeader } from '../../src/shared/navigation.js';
import {
  getDailyPainting,
  getRandomCuratedPainting,
} from './daily-art.js';
import {
  searchMuseumArtworks,
  loadCORSImage,
} from '../../src/shared/art-api.js';

// 1. Initialize Room Header
initRoomHeader({
  roomNumber: '✦',
  roomTitle: 'Il Quadro del Giorno',
  badgeText: 'ORACOLO DELLA BELLEZZA',
  statusText: 'CONTEMPLAZIONE',
});

// Ambient Particles Canvas
const canvas = document.getElementById('ambientCanvas');
const ctx = canvas.getContext('2d');
let w = (canvas.width = window.innerWidth);
let h = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
});

const motes = Array.from({ length: 35 }, () => ({
  x: Math.random() * w,
  y: Math.random() * h,
  vx: (Math.random() - 0.5) * 0.25,
  vy: (Math.random() - 0.5) * 0.25,
  r: Math.random() * 1.8 + 0.6,
  alpha: Math.random() * 0.4 + 0.1,
}));

function animateAmbient() {
  ctx.clearRect(0, 0, w, h);
  motes.forEach((m) => {
    m.x += m.vx;
    m.y += m.vy;
    if (m.x < 0) m.x = w;
    if (m.x > w) m.x = 0;
    if (m.y < 0) m.y = h;
    if (m.y > h) m.y = 0;

    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 210, 140, ${m.alpha})`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255, 180, 100, 0.4)';
    ctx.fill();
    ctx.shadowBlur = 0;
  });
  requestAnimationFrame(animateAmbient);
}
animateAmbient();

// DOM Elements
const paintingImg = document.getElementById('paintingImg');
const imageLoader = document.getElementById('imageLoader');

const plaqueArtist = document.getElementById('plaqueArtist');
const plaqueTitle = document.getElementById('plaqueTitle');

const displayDate = document.getElementById('displayDate');
const pieceTitle = document.getElementById('pieceTitle');
const pieceArtist = document.getElementById('pieceArtist');
const pieceYear = document.getElementById('pieceYear');
const pieceMuseum = document.getElementById('pieceMuseum');

const pieceStory = document.getElementById('pieceStory');
const pieceDetail = document.getElementById('pieceDetail');
const pieceComfort = document.getElementById('pieceComfort');

const btnRandomArt = document.getElementById('btnRandomArt');
const btnFavorite = document.getElementById('btnFavorite');
const favIcon = document.getElementById('favIcon');
const favLabel = document.getElementById('favLabel');
const favCount = document.getElementById('favCount');
const btnOpenFavorites = document.getElementById('btnOpenFavorites');

const favModal = document.getElementById('favModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const favListContainer = document.getElementById('favListContainer');

// Search elements
const inputArtSearch = document.getElementById('inputArtSearch');
const btnSearch = document.getElementById('btnSearch');
const searchResults = document.getElementById('searchResults');

// State
let currentPiece = null;
let favorites = [];

try {
  favorites = JSON.parse(localStorage.getItem('wk_favorites') || '[]');
} catch (e) {
  favorites = [];
}
updateFavCount();

// 2. Display Artwork
async function displayPiece(piece) {
  currentPiece = piece;
  imageLoader.classList.remove('hidden');
  paintingImg.classList.remove('loaded');

  // Text contents
  pieceTitle.textContent = piece.title;
  pieceArtist.textContent = piece.artist;
  pieceYear.textContent = piece.year || 'Epoca Classica';
  pieceMuseum.textContent = piece.museum || 'Collezione Museale Aperta';

  plaqueArtist.textContent = piece.artist.split('(')[0].trim();
  plaqueTitle.textContent = piece.title.split('(')[0].trim();

  pieceStory.textContent = piece.story || 'Un capolavoro che custodisce secoli di luce, forma e sentimento.';
  pieceDetail.textContent = piece.detailToSeek || 'Osserva con calma le sfumature di luce ai margini del dipinto.';
  pieceComfort.textContent = piece.comfortThought || 'Ogni grande opera ci ricorda che la bellezza è una promessa mantenuta nel tempo.';

  updateFavButton();

  // Load Image
  try {
    const loadedImg = await loadCORSImage(piece.image);
    paintingImg.src = loadedImg.src;
    paintingImg.classList.add('loaded');
  } catch (err) {
    console.warn('Image load error, setting direct src:', err);
    paintingImg.src = piece.image;
    paintingImg.onload = () => paintingImg.classList.add('loaded');
  } finally {
    imageLoader.classList.add('hidden');
  }
}

// 3. Daily initialization
const todayPiece = getDailyPainting();
if (displayDate) displayDate.textContent = todayPiece.dateFormatted;
displayPiece(todayPiece);

// 4. Random Discovery
btnRandomArt.addEventListener('click', () => {
  const randPiece = getRandomCuratedPainting(currentPiece ? currentPiece.id : null);
  displayPiece(randPiece);
});

// 5. Favorites System
function updateFavCount() {
  favCount.textContent = favorites.length;
}

function updateFavButton() {
  if (!currentPiece) return;
  const isFav = favorites.some((f) => f.id === currentPiece.id);
  if (isFav) {
    favIcon.textContent = '❤️';
    favLabel.textContent = 'Nei Tuoi Preferiti';
    btnFavorite.classList.add('wk-btn-gold');
    btnFavorite.classList.remove('wk-btn-cyan');
  } else {
    favIcon.textContent = '🤍';
    favLabel.textContent = 'Salva nei Preferiti';
    btnFavorite.classList.remove('wk-btn-gold');
    btnFavorite.classList.add('wk-btn-cyan');
  }
}

btnFavorite.addEventListener('click', () => {
  if (!currentPiece) return;
  const idx = favorites.findIndex((f) => f.id === currentPiece.id);
  if (idx >= 0) {
    favorites.splice(idx, 1);
  } else {
    favorites.push({
      id: currentPiece.id,
      title: currentPiece.title,
      artist: currentPiece.artist,
      year: currentPiece.year,
      image: currentPiece.image,
      museum: currentPiece.museum,
      story: currentPiece.story,
      detailToSeek: currentPiece.detailToSeek,
      comfortThought: currentPiece.comfortThought,
    });
  }

  try {
    localStorage.setItem('wk_favorites', JSON.stringify(favorites));
  } catch (e) {}

  updateFavCount();
  updateFavButton();
});

btnOpenFavorites.addEventListener('click', () => {
  renderFavoritesModal();
  favModal.classList.add('active');
});

btnCloseModal.addEventListener('click', () => {
  favModal.classList.remove('active');
});

favModal.addEventListener('click', (e) => {
  if (e.target === favModal) favModal.classList.remove('active');
});

function renderFavoritesModal() {
  favListContainer.innerHTML = '';
  if (favorites.length === 0) {
    favListContainer.innerHTML = `
      <p style="color: var(--text-muted); font-family: var(--font-serif); font-size: 1.1rem; text-align: center; padding: 2rem 0;">
        Non hai ancora salvato nessun dipinto. Clicca su "Salva nei Preferiti" quando trovi un'opera che ti scalda il cuore!
      </p>
    `;
    return;
  }

  favorites.forEach((fav) => {
    const card = document.createElement('div');
    card.className = 'wk-fav-card';
    card.innerHTML = `
      <img src="${fav.image}" class="wk-fav-thumb" alt="${fav.title}" />
      <div style="flex: 1;">
        <h4 style="font-family: var(--font-title); font-size: 0.85rem; color: var(--gold-primary);">${fav.title}</h4>
        <p style="font-family: var(--font-serif); font-size: 0.8rem; color: var(--text-muted);">${fav.artist}</p>
      </div>
      <button class="wk-btn wk-btn-sm" style="padding: 0.2rem 0.5rem;">Mostra</button>
    `;

    card.addEventListener('click', () => {
      favModal.classList.remove('active');
      displayPiece(fav);
    });

    favListContainer.appendChild(card);
  });
}

// 6. Live Museum Search (Art Institute of Chicago API)
async function handleMuseumSearch() {
  const query = inputArtSearch.value.trim();
  if (!query) return;

  btnSearch.textContent = '...';
  searchResults.innerHTML = '';

  try {
    const results = await searchMuseumArtworks(query, 5);
    if (results.length === 0) {
      searchResults.innerHTML = `<span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted);">Nessuna opera trovata.</span>`;
    } else {
      results.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'wk-result-item';
        row.innerHTML = `
          <div>
            <div class="wk-result-title">${item.title}</div>
            <div class="wk-result-artist">${item.artist} (${item.year || ''})</div>
          </div>
          <span style="color: var(--gold-primary); font-size: 0.8rem;">→</span>
        `;

        row.addEventListener('click', () => {
          displayPiece({
            id: item.id,
            title: item.title,
            artist: item.artist,
            year: item.year,
            museum: 'Art Institute of Chicago (Open Access)',
            image: item.url,
            story: `Quest'opera, custodita presso l'Art Institute of Chicago, rappresenta una straordinaria testimonianza della sensibilità dell'artista per la luce e lo spazio. Ogni pennellata racconta una storia di dedizione e ricerca della purezza visiva.`,
            detailToSeek: `Osserva il gioco di contrasti cromatici e la naturalezza della composizione.`,
            comfortThought: `L'arte è un ponte invisibile che unisce epoche lontane: qualcuno ha dipinto questa meraviglia pensando al futuro, e oggi è qui per te.`,
          });
        });

        searchResults.appendChild(row);
      });
    }
  } catch (err) {
    console.error('Search error:', err);
  } finally {
    btnSearch.textContent = 'Cerca';
  }
}

btnSearch.addEventListener('click', handleMuseumSearch);
inputArtSearch.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleMuseumSearch();
});
