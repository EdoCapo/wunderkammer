/**
 * Wunderkammer — Shared Museum & Open Access Art API Service
 * 
 * Provides:
 * 1. Curated real high-resolution masterpieces (Art Institute of Chicago IIIF & Met Museum Open Access, 100% CORS-friendly)
 * 2. Live search API querying over 100,000 public domain museum works (Art Institute of Chicago IIIF API)
 * 3. Resilient CORS image loader with fallback handling and procedural art generator
 */

export const CURATED_MASTERPIECES = [
  {
    id: 'hopper_nighthawks',
    title: 'I Nottambuli (Nighthawks)',
    artist: 'Edward Hopper',
    year: '1942',
    museum: 'Art Institute of Chicago',
    url: 'https://www.artic.edu/iiif/2/831a05de-d3f6-f4fa-a460-23008dd58dda/full/843,/0/default.jpg',
  },
  {
    id: 'van_gogh_camera',
    title: 'La Camera da Letto ad Arles',
    artist: 'Vincent van Gogh',
    year: '1889',
    museum: 'Art Institute of Chicago',
    url: 'https://www.artic.edu/iiif/2/6644829f-f292-c5c4-a73c-0356a6fdbf0d/full/843,/0/default.jpg',
  },
  {
    id: 'seurat_grande_jatte',
    title: 'Una Domenica alla Grande Jatte',
    artist: 'Georges Seurat',
    year: '1884–1886',
    museum: 'Art Institute of Chicago',
    url: 'https://www.artic.edu/iiif/2/2d484387-2509-5e8e-2c43-22f9981972eb/full/843,/0/default.jpg',
  },
  {
    id: 'monet_ninfee',
    title: 'Lo Stagno delle Ninfee',
    artist: 'Claude Monet',
    year: '1906',
    museum: 'Art Institute of Chicago',
    url: 'https://www.artic.edu/iiif/2/3c27b499-af56-f0d5-93b5-a7f2f1ad5813/full/843,/0/default.jpg',
  },
  {
    id: 'hokusai_onda',
    title: 'La Grande Onda di Kanagawa',
    artist: 'Katsushika Hokusai',
    year: '1831',
    museum: 'Art Institute of Chicago',
    url: 'https://www.artic.edu/iiif/2/b3974542-b9b4-7568-fc4b-966738f61d78/full/843,/0/default.jpg',
  },
  {
    id: 'van_gogh_autoritratto',
    title: 'Autoritratto con Cappello di Feltro',
    artist: 'Vincent van Gogh',
    year: '1887',
    museum: 'Art Institute of Chicago',
    url: 'https://www.artic.edu/iiif/2/47c5bcb8-62ef-e5d7-55e7-f5121f409a30/full/843,/0/default.jpg',
  },
  {
    id: 'turner_venezia',
    title: 'Il Canal Grande, Venezia',
    artist: 'J.M.W. Turner',
    year: '1835',
    museum: 'Metropolitan Museum of Art, New York',
    url: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1871.jpg',
  },
  {
    id: 'sargent_madame_x',
    title: 'Madame X (Virginie Gautreau)',
    artist: 'John Singer Sargent',
    year: '1884',
    museum: 'Metropolitan Museum of Art, New York',
    url: 'https://images.metmuseum.org/CRDImages/ap/web-large/DP-14286-044.jpg',
  },
  {
    id: 'bruegel_mietitori',
    title: 'I Mietitori',
    artist: 'Pieter Bruegel il Vecchio',
    year: '1565',
    museum: 'Metropolitan Museum of Art, New York',
    url: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP130999.jpg',
  },
  {
    id: 'rembrandt_aristotele',
    title: 'Aristotele con il Busto di Omero',
    artist: 'Rembrandt van Rijn',
    year: '1653',
    museum: 'Metropolitan Museum of Art, New York',
    url: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP146452.jpg',
  },
];

/**
 * Searches the Art Institute of Chicago Open Access IIIF API
 * Free, NO API key required, 100% CORS-friendly!
 * @param {string} query e.g. "Caravaggio", "Monet", "Klimt", "Rembrandt"
 * @param {number} limit
 * @returns {Promise<Array<{ id: string, title: string, artist: string, year: string, url: string }>>}
 */
export async function searchMuseumArtworks(query, limit = 8) {
  try {
    const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(
      query
    )}&query[term][is_public_domain]=true&limit=${limit}&fields=id,title,artist_title,date_display,image_id`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const results = [];
    if (data && data.data) {
      data.data.forEach((item) => {
        if (item.image_id) {
          // Construct IIIF high-resolution image URL (width 843px, CORS enabled)
          const imgUrl = `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`;
          results.push({
            id: `artic_${item.id}`,
            title: item.title || "Opera d'Arte",
            artist: item.artist_title || 'Artista Ignoto',
            year: item.date_display || '',
            url: imgUrl,
          });
        }
      });
    }

    if (results.length === 0) {
      // Fallback search inside curated list
      const q = query.toLowerCase();
      return CURATED_MASTERPIECES.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.artist.toLowerCase().includes(q)
      );
    }

    return results;
  } catch (err) {
    console.warn('Museum API Search fallback:', err);
    const q = query.toLowerCase();
    return CURATED_MASTERPIECES.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.artist.toLowerCase().includes(q)
    );
  }
}

/**
 * Loads an image from URL into an HTMLImageElement with robust CORS & timeout handling
 * @param {string} url
 * @param {string} [fallbackUrl]
 * @param {number} [timeoutMs=8000]
 * @returns {Promise<HTMLImageElement>}
 */
export function loadCORSImage(url, fallbackUrl = null, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    let timer = null;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';

    const cleanup = () => {
      if (timer) clearTimeout(timer);
    };

    img.onload = () => {
      cleanup();
      resolve(img);
    };

    img.onerror = (e) => {
      cleanup();
      if (fallbackUrl && fallbackUrl !== url) {
        console.warn(`Primary image failed (${url}), trying fallback: ${fallbackUrl}`);
        loadCORSImage(fallbackUrl, null, timeoutMs)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error(`Impossibile caricare l'immagine da ${url}`));
      }
    };

    timer = setTimeout(() => {
      img.src = '';
      if (fallbackUrl && fallbackUrl !== url) {
        loadCORSImage(fallbackUrl, null, timeoutMs)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error(`Timeout nel caricamento dell'immagine: ${url}`));
      }
    }, timeoutMs);

    img.src = url;
  });
}

/**
 * Procedural artistic fallback generator (returns HTMLCanvasElement)
 * Creates a rich, classical oil painting appearance with chiaroscuro, impasto texture and palette
 */
export function createArtisticFallbackCanvas(width = 800, height = 600, title = 'Notturno Dorato', artist = 'Bottega Classica') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Deep dark ground (terra d'ombra & lapis)
  const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.45, 40, width * 0.5, height * 0.5, Math.max(width, height) * 0.7);
  bgGrad.addColorStop(0, '#3a2e1d');
  bgGrad.addColorStop(0.35, '#1e2430');
  bgGrad.addColorStop(0.7, '#11151c');
  bgGrad.addColorStop(1, '#080a0d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Atmospheric golden chiaroscuro glow
  const goldGlow = ctx.createRadialGradient(width * 0.45, height * 0.4, 10, width * 0.45, height * 0.4, width * 0.35);
  goldGlow.addColorStop(0, 'rgba(235, 195, 110, 0.85)');
  goldGlow.addColorStop(0.4, 'rgba(180, 115, 50, 0.45)');
  goldGlow.addColorStop(0.8, 'rgba(80, 45, 20, 0.15)');
  goldGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = goldGlow;
  ctx.beginPath();
  ctx.arc(width * 0.45, height * 0.4, width * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Classical figurative silhouette & drapery
  ctx.fillStyle = 'rgba(25, 18, 14, 0.75)';
  ctx.beginPath();
  ctx.ellipse(width * 0.48, height * 0.52, width * 0.16, height * 0.28, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Golden drapery folds (cinabro & orpimento touches)
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(width * 0.4, height * 0.42);
  ctx.bezierCurveTo(width * 0.45, height * 0.55, width * 0.38, height * 0.68, width * 0.44, height * 0.78);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(240, 140, 60, 0.5)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width * 0.52, height * 0.44);
  ctx.bezierCurveTo(width * 0.58, height * 0.58, width * 0.5, height * 0.7, width * 0.56, height * 0.8);
  ctx.stroke();

  // Subtle canvas grain noise
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 14;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  return canvas;
}
