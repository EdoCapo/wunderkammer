/**
 * Wunderkammer — Room 01: Pigment Engine
 * Implementation of Kubelka-Munk subtractive optical mixing & chemical aging matrix
 */

export const HISTORICAL_PIGMENTS = {
  schweinfurt: {
    id: 'schweinfurt',
    name: 'Verde di Schweinfurt',
    subname: 'Acetoarsenito di Rame (Parigi, 1814)',
    formula: 'Cu(C₂H₃O₂)₂ · 3Cu(AsO₂)₂',
    history: 'Pigmento sintetico tossico a base di arsenico, celebre per la brillantezza smeraldina. Estremamente reattivo ai fumi solforati.',
    baseColor: '#1fa055',
    // K (Absorption) and S (Scattering) coefficients for [R, G, B]
    K: [0.85, 0.08, 0.65],
    S: [0.35, 0.95, 0.40],
    toxicity: 'Lethal (Arsenico)',
    calcAgedColor: (timeYears, uv, humidity) => {
      // Darkens into murky brownish-black with sulfur/oil degradation
      const ageFactor = (timeYears / 500) * (0.4 + 0.6 * humidity);
      const r = Math.max(15, 31 - ageFactor * 16 + ageFactor * 40);
      const g = Math.max(25, 160 - ageFactor * 115);
      const b = Math.max(10, 85 - ageFactor * 65);
      return { r, g, b, craquelureTendency: 0.2 };
    },
  },

  giallo_indiano: {
    id: 'giallo_indiano',
    name: 'Giallo Indiano',
    subname: 'Eusantato di Magnesio (Monghyr, sec. XV)',
    formula: 'C₁₉H₁₆O₁₁Mg · 5H₂O',
    history: 'Ricavato dall’urina di mucche nutrite solo con foglie di mango. Trasparente e luminescente, ma suscettibile alla fotosbiancatura UV.',
    baseColor: '#e5a00d',
    K: [0.12, 0.35, 0.95],
    S: [0.85, 0.80, 0.15],
    toxicity: 'Naturale (Bandito 1908)',
    calcAgedColor: (timeYears, uv, humidity) => {
      // Bleaches and browns under UV radiation
      const uvImpact = (timeYears / 500) * (0.3 + 0.7 * uv);
      const r = Math.min(240, 229 - uvImpact * 60 + uvImpact * 20);
      const g = Math.max(60, 160 - uvImpact * 90);
      const b = Math.min(110, 13 + uvImpact * 80);
      return { r, g, b, craquelureTendency: 0.15 };
    },
  },

  oltremare: {
    id: 'oltremare',
    name: 'Blu Oltremare Naturale',
    subname: 'Lapislazzuli delle miniere di Badakhshan',
    formula: 'Na₈₋₁₀Al₆Si₆O₂₄S₂₋₄',
    history: 'Il pigmento più costoso del Rinascimento, più dell’oro. Inattaccabile dalla luce, ma vittima della "malattia dell\'oltremare" in ambienti acidi e umidi.',
    baseColor: '#18389e',
    K: [0.92, 0.75, 0.05],
    S: [0.25, 0.35, 0.95],
    toxicity: 'Inerte (Minerale nobile)',
    calcAgedColor: (timeYears, uv, humidity) => {
      // Ultramarine sickness: grayish bleached opacity with high humidity/acid
      const moistureImpact = (timeYears / 500) * Math.pow(humidity, 1.4);
      const r = Math.min(160, 24 + moistureImpact * 120);
      const g = Math.min(170, 56 + moistureImpact * 105);
      const b = Math.max(80, 158 - moistureImpact * 50);
      return { r, g, b, craquelureTendency: 0.25 };
    },
  },

  nero_mummia: {
    id: 'nero_mummia',
    name: 'Nero di Mummia',
    subname: 'Caput Mortuum Bituminoso (sec. XVI-XIX)',
    formula: 'Idrocarburi policiclici & Resine organiche',
    history: 'Prodotto macinando mummie egizie imbalsamate con asfalto e resine. Asciuga con lentezza esasperante e genera craquelure profondo ad "alligatore".',
    baseColor: '#2b1e17',
    K: [0.96, 0.98, 0.99],
    S: [0.15, 0.12, 0.10],
    toxicity: 'Organico (Bizarre)',
    calcAgedColor: (timeYears, uv, humidity) => {
      // Shrinks and darkens, high alligatoring
      const age = timeYears / 500;
      const r = Math.max(10, 43 - age * 25);
      const g = Math.max(8, 30 - age * 20);
      const b = Math.max(6, 23 - age * 16);
      return { r, g, b, craquelureTendency: 0.95 };
    },
  },

  biacca: {
    id: 'biacca',
    name: 'Biacca di Piombo',
    subname: 'Bianco di Saturno (Metodo Olandese)',
    formula: '2PbCO₃ · Pb(OH)₂',
    history: 'Il bianco sovrano della pittura classica. Ingiallisce e annerisce al buio per formazione di solfuro di piombo (PbS), ma sbianca miracolosamente se esposto alla luce.',
    baseColor: '#f4ede1',
    K: [0.03, 0.04, 0.08],
    S: [0.98, 0.97, 0.95],
    toxicity: 'Altamente Tossico (Saturnismo)',
    calcAgedColor: (timeYears, uv, humidity) => {
      // In the dark (low UV), it turns dirty yellowish-brown due to lead sulfide!
      // In high UV, it bleaches back towards bright white!
      const age = timeYears / 500;
      const darknessShift = age * (1.0 - uv * 0.85) * (0.5 + 0.5 * humidity);
      const r = Math.max(120, 244 - darknessShift * 90);
      const g = Math.max(105, 237 - darknessShift * 110);
      const b = Math.max(70, 225 - darknessShift * 155);
      return { r, g, b, craquelureTendency: 0.45 };
    },
  },

  cinabro: {
    id: 'cinabro',
    name: 'Cinabro Naturale (Vermiglione)',
    subname: 'Solfuro di Mercurio (Almadén)',
    formula: 'α-HgS',
    history: 'Il rosso fiammeggiante dell\'antichità romana e rinascimentale. Subisce fotodegradazione metastabile virando a nero per conversione in metacinabro (β-HgS).',
    baseColor: '#b92823',
    K: [0.15, 0.92, 0.95],
    S: [0.88, 0.20, 0.15],
    toxicity: 'Tossico (Mercurio)',
    calcAgedColor: (timeYears, uv, humidity) => {
      // Photodegrades to black metacinnabar under UV and chlorine/light
      const photoDegradation = (timeYears / 500) * Math.pow(uv, 1.2);
      const r = Math.max(25, 185 - photoDegradation * 155);
      const g = Math.max(22, 40 - photoDegradation * 20);
      const b = Math.max(20, 35 - photoDegradation * 16);
      return { r, g, b, craquelureTendency: 0.3 };
    },
  },
};

/**
 * Kubelka-Munk Subtractive Optical Mixing
 * Mixes multiple pigment concentrations c_i with absorption K_i and scattering S_i
 * @param {Array<{ pigment: Object, concentration: number }>} components
 * @returns {{ r: number, g: number, b: number, hex: string, kOverS: number[] }}
 */
export function mixKubelkaMunk(components) {
  let totalConc = 0;
  components.forEach((c) => (totalConc += c.concentration));
  if (totalConc <= 0) return { r: 245, g: 240, b: 230, hex: '#f5f0e6', kOverS: [0, 0, 0] };

  // Calculate mixed K and S for R, G, B channels
  const channels = [0, 1, 2];
  const rgb = channels.map((ch) => {
    let weightedK = 0;
    let weightedS = 0;

    components.forEach(({ pigment, concentration }) => {
      const weight = concentration / totalConc;
      weightedK += weight * pigment.K[ch];
      weightedS += weight * pigment.S[ch];
    });

    const ks = weightedK / Math.max(0.001, weightedS);

    // Reflectance of opaque film: R_inf = 1 + K/S - sqrt((K/S)^2 + 2(K/S))
    const rInf = 1.0 + ks - Math.sqrt(ks * ks + 2.0 * ks);
    return Math.min(255, Math.max(0, Math.round(rInf * 255)));
  });

  const hex =
    '#' +
    rgb
      .map((x) => {
        const h = x.toString(16);
        return h.length === 1 ? '0' + h : h;
      })
      .join('');

  return {
    r: rgb[0],
    g: rgb[1],
    b: rgb[2],
    hex,
  };
}

/**
 * Procedural Voronoi Craquelure Generator
 * Renders microscopic cracks on an HTML5 canvas overlay
 */
export function renderCraquelureOverlay(ctx, width, height, density, intensity) {
  if (intensity <= 0.02) return;

  const pointsCount = Math.floor(density * 180);
  const seedPoints = [];

  for (let i = 0; i < pointsCount; i++) {
    seedPoints.push({
      x: Math.random() * width,
      y: Math.random() * height,
    });
  }

  ctx.save();
  ctx.strokeStyle = `rgba(18, 14, 10, ${Math.min(0.85, intensity * 0.75)})`;
  ctx.lineWidth = Math.max(0.5, intensity * 1.5);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Delaunay-like crack network between close Voronoi centers
  for (let i = 0; i < seedPoints.length; i++) {
    const p1 = seedPoints[i];
    let neighbors = [];

    for (let j = 0; j < seedPoints.length; j++) {
      if (i === j) continue;
      const p2 = seedPoints[j];
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      if (dist < 65) {
        neighbors.push({ p: p2, dist });
      }
    }

    neighbors.sort((a, b) => a.dist - b.dist);
    const connectionCount = Math.min(neighbors.length, 3);

    for (let k = 0; k < connectionCount; k++) {
      const p2 = neighbors[k].p;
      // Jittered crack path
      const midX = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 8;
      const midY = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 8;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
      ctx.stroke();
    }
  }

  ctx.restore();
}
