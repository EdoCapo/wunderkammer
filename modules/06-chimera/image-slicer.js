/**
 * Wunderkammer — Room 06: Procedural Slicer & Cadavre Exquis Compositor
 * Combines 3 museum images with seamless gradient alpha feathering and chromatic harmonization
 */

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Create fallback artistic gradient canvas if CORS prevents image load
      const c = document.createElement('canvas');
      c.width = 500;
      c.height = 500;
      const ctx = c.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 500, 500);
      g.addColorStop(0, '#2d1f14');
      g.addColorStop(0.5, '#7a5a32');
      g.addColorStop(1, '#0e0b09');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 500, 500);
      resolve(c);
    };
    img.src = src;
  });
}

/**
 * Composites 3 slices into the canvas with soft alpha feathering
 */
export async function compositeChimera(canvas, topImg, midImg, botImg, options = {}) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Buffer canvas for layered rendering
  const bufferCanvas = document.createElement('canvas');
  bufferCanvas.width = w;
  bufferCanvas.height = h;
  const bCtx = bufferCanvas.getContext('2d');

  // 1. Draw Top Band (Sky / Architectural vault)
  // Height: 0% to 34%
  const hTop = h * 0.34;
  bCtx.drawImage(topImg, 0, 0, topImg.width, topImg.height * 0.5, 0, 0, w, hTop);

  // 2. Draw Middle Band (Torso / Face / Armor)
  // Height: 26% to 74% with feathered top and bottom masks
  const yMid = h * 0.25;
  const hMid = h * 0.52;

  const midSliceCanvas = document.createElement('canvas');
  midSliceCanvas.width = w;
  midSliceCanvas.height = hMid;
  const mCtx = midSliceCanvas.getContext('2d');

  mCtx.drawImage(midImg, 0, midImg.height * 0.2, midImg.width, midImg.height * 0.6, 0, 0, w, hMid);

  // Apply alpha feathering gradient to top and bottom edges of mid slice
  mCtx.globalCompositeOperation = 'destination-in';
  const featherGrad = mCtx.createLinearGradient(0, 0, 0, hMid);
  featherGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  featherGrad.addColorStop(0.18, 'rgba(0, 0, 0, 1)');
  featherGrad.addColorStop(0.82, 'rgba(0, 0, 0, 1)');
  featherGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  mCtx.fillStyle = featherGrad;
  mCtx.fillRect(0, 0, w, hMid);

  bCtx.drawImage(midSliceCanvas, 0, yMid);

  // 3. Draw Bottom Band (Drapery / Floor / Mythical beasts)
  // Height: 68% to 100% with feathered top
  const yBot = h * 0.68;
  const hBot = h * 0.32;

  const botSliceCanvas = document.createElement('canvas');
  botSliceCanvas.width = w;
  botSliceCanvas.height = hBot;
  const botCtx = botSliceCanvas.getContext('2d');

  botCtx.drawImage(botImg, 0, botImg.height * 0.5, botImg.width, botImg.height * 0.5, 0, 0, w, hBot);

  botCtx.globalCompositeOperation = 'destination-in';
  const botFeather = botCtx.createLinearGradient(0, 0, 0, hBot);
  botFeather.addColorStop(0, 'rgba(0, 0, 0, 0)');
  botFeather.addColorStop(0.22, 'rgba(0, 0, 0, 1)');
  botFeather.addColorStop(1, 'rgba(0, 0, 0, 1)');
  botCtx.fillStyle = botFeather;
  botCtx.fillRect(0, 0, w, hBot);

  bCtx.drawImage(botSliceCanvas, 0, yBot);

  // Draw composited image onto target canvas
  ctx.drawImage(bufferCanvas, 0, 0);

  // 4. Chromatic Harmonization Layer (Warm museum varnish overlay)
  const harmonization = options.harmonization !== undefined ? options.harmonization : 0.25;
  if (harmonization > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = `rgba(180, 125, 45, ${harmonization * 0.8})`;
    ctx.fillRect(0, 0, w, h);

    // Subtle vignette
    const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(10, 8, 6, 0.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }
}
