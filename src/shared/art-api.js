/**
 * Wunderkammer — Shared Museum & Open Access Art API Service
 * 
 * Provides:
 * 1. Curated real high-resolution masterpieces (Wikimedia Commons & Art Institute of Chicago, CORS-enabled)
 * 2. Live search API querying over 100,000 public domain museum works (Art Institute of Chicago IIIF API)
 */

export const CURATED_MASTERPIECES = [
  {
    id: 'monalisa',
    title: 'Monna Lisa (La Gioconda)',
    artist: 'Leonardo da Vinci',
    year: '1503–1519',
    museum: 'Musée du Louvre, Parigi',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
  },
  {
    id: 'vermeer',
    title: 'Ragazza con l\'Orecchino di Perla',
    artist: 'Johannes Vermeer',
    year: 'circa 1665',
    museum: 'Mauritshuis, L\'Aia',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg',
  },
  {
    id: 'venere',
    title: 'La Nascita di Venere',
    artist: 'Sandro Botticelli',
    year: '1485',
    museum: 'Galleria degli Uffizi, Firenze',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1024px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg',
  },
  {
    id: 'notte_stellata',
    title: 'Notte Stellata',
    artist: 'Vincent van Gogh',
    year: '1889',
    museum: 'Museum of Modern Art, New York',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1024px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
  },
  {
    id: 'dama_ermellino',
    title: 'Dama con l\'Ermellino',
    artist: 'Leonardo da Vinci',
    year: '1489–1490',
    museum: 'Muzeum Czartoryskich, Cracovia',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Lady_with_an_Ermine_-_Leonardo_da_Vinci_-_Google_Art_Project.jpg/800px-Lady_with_an_Ermine_-_Leonardo_da_Vinci_-_Google_Art_Project.jpg',
  },
  {
    id: 'caravaggio_bacco',
    title: 'Bacco',
    artist: 'Caravaggio',
    year: '1596–1598',
    museum: 'Galleria degli Uffizi, Firenze',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Bacco_-_Caravaggio.jpg/800px-Bacco_-_Caravaggio.jpg',
  },
  {
    id: 'rembrandt_autoritratto',
    title: 'Autoritratto con Berretto e Collo Rialzato',
    artist: 'Rembrandt van Rijn',
    year: '1659',
    museum: 'National Gallery of Art, Washington',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg/800px-Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg',
  },
  {
    id: 'hokusai_onda',
    title: 'La Grande Onda di Kanagawa',
    artist: 'Katsushika Hokusai',
    year: '1831',
    museum: 'Metropolitan Museum of Art, New York',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1024px-Tsunami_by_hokusai_19th_century.jpg',
  },
];

/**
 * Searches the Art Institute of Chicago Open Access IIIF API
 * Free, NO API key required, 100% CORS-friendly!
 * @param {string} query e.g. "Caravaggio", "Monet", "Klimt", "Rembrandt"
 * @param {number} limit
 * @returns {Promise<Array<{ id: number, title: string, artist: string, year: string, url: string }>>}
 */
export async function searchMuseumArtworks(query, limit = 8) {
  try {
    const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(
      query
    )}&query[term][is_public_domain]=true&limit=${limit}&fields=id,title,artist_title,date_display,image_id`;

    const res = await fetch(url);
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
            title: item.title || 'Opera d\'Arte',
            artist: item.artist_title || 'Artista Ignoto',
            year: item.date_display || '',
            url: imgUrl,
          });
        }
      });
    }
    return results;
  } catch (err) {
    console.warn('Museum API Search fallback:', err);
    // Filter from curated list as fallback
    const q = query.toLowerCase();
    return CURATED_MASTERPIECES.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.artist.toLowerCase().includes(q)
    );
  }
}

/**
 * Loads an image from URL into an HTMLImageElement with CORS enabled
 */
export function loadCORSImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Impossibile caricare l'immagine da ${url}`));
    img.src = url;
  });
}
