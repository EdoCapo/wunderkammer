/**
 * Wunderkammer — Room 02: Scanpath & Saccadic Eye Movement Simulator
 * Itti-Koch Saliency Map, Winner-Take-All (WTA) & Inhibition of Return (IoR)
 * Optimized with Gaussian inhibition centers for butter-smooth 60 FPS performance.
 */

export class ScanpathSimulator {
  /**
   * @param {ImageData} imageData 
   * @param {Object} gradientData 
   */
  constructor(imageData, gradientData) {
    this.width = imageData.width;
    this.height = imageData.height;
    this.imageData = imageData;
    this.gradientData = gradientData;

    this.saliencyMap = new Float32Array(this.width * this.height);
    this.inhibitionCenters = [];

    // Current eye gaze state
    this.currentGaze = { x: this.width / 2, y: this.height / 2 };
    this.targetGaze = { x: this.width / 2, y: this.height / 2 };
    this.isSaccading = false;
    this.saccadeProgress = 1.0;
    this.saccadeStart = { x: this.width / 2, y: this.height / 2 };

    // Saccadic path history: [{ x, y, duration, order }]
    this.fixations = [];
    this.currentDwell = 0;
    this.minDwellFrames = 25; // ~400ms fixation dwell time
    this.maxFixations = 18;

    this.computeSaliency();
    this.findNextFixation();
  }

  computeSaliency() {
    const { width, height, data } = this.imageData;
    const { magnitude, luminance } = this.gradientData;
    const size = width * height;

    let maxSal = 0;

    for (let i = 0, p = 0; i < size; i++, p += 4) {
      const r = data[p] / 255;
      const g = data[p + 1] / 255;
      const b = data[p + 2] / 255;

      // Color Opponency Channels
      const rgOpponency = Math.abs(r - g);
      const byOpponency = Math.abs(b - (r + g) * 0.5);

      // Edge energy
      const edgeSal = magnitude[i];

      // Luminance contrast
      const lumSal = Math.abs(luminance[i] - 0.5) * 1.5;

      // Combined Saliency
      const sal = edgeSal * 0.45 + rgOpponency * 0.25 + byOpponency * 0.15 + lumSal * 0.15;
      this.saliencyMap[i] = sal;

      if (sal > maxSal) maxSal = sal;
    }

    if (maxSal > 0) {
      for (let i = 0; i < size; i++) {
        this.saliencyMap[i] /= maxSal;
      }
    }
  }

  /**
   * Applies Winner-Take-All with Inhibition of Return
   */
  findNextFixation() {
    const { width, height } = this;

    let highestVal = -Infinity;
    let bestX = width / 2;
    let bestY = height / 2;

    const numInh = this.inhibitionCenters.length;

    // Sub-sample grid for fast WTA evaluation (step = 8)
    const step = 8;
    for (let y = step; y < height - step; y += step) {
      const rowOffset = y * width;
      for (let x = step; x < width - step; x += step) {
        const idx = rowOffset + x;

        // Calculate dynamic Gaussian Inhibition from active centers
        let totalInhibition = 0;
        for (let c = 0; c < numInh; c++) {
          const ic = this.inhibitionCenters[c];
          const dSq = (x - ic.cx) * (x - ic.cx) + (y - ic.cy) * (y - ic.cy);
          const rSq = ic.radius * ic.radius;
          if (dSq < rSq * 3.5) {
            totalInhibition += Math.exp(-dSq / (2 * rSq)) * ic.strength;
          }
        }

        const effectiveSal = this.saliencyMap[idx] - totalInhibition;

        // Central bias prior (human vision leans towards center)
        const distFromCenter = Math.hypot(x - width / 2, y - height / 2) / (width * 0.65);
        const centerBias = 1.0 - distFromCenter * 0.35;

        const score = effectiveSal * centerBias;

        if (score > highestVal) {
          highestVal = score;
          bestX = x;
          bestY = y;
        }
      }
    }

    // Trigger saccadic jump to winning coordinates
    this.saccadeStart = { ...this.currentGaze };
    this.targetGaze = { x: bestX, y: bestY };
    this.saccadeProgress = 0;
    this.isSaccading = true;
    this.currentDwell = 0;

    // Apply new Inhibition of Return Gaussian at target
    this.inhibitionCenters.push({
      cx: bestX,
      cy: bestY,
      radius: Math.min(width, height) * 0.16,
      strength: 1.4,
    });

    if (this.inhibitionCenters.length > 12) {
      this.inhibitionCenters.shift();
    }
  }

  update() {
    // 1. Decay Inhibition Centers smoothly
    for (let i = 0; i < this.inhibitionCenters.length; i++) {
      this.inhibitionCenters[i].strength *= 0.985;
    }
    this.inhibitionCenters = this.inhibitionCenters.filter((c) => c.strength > 0.05);

    // 2. Animate Saccade or Accumulate Dwell
    if (this.isSaccading) {
      this.saccadeProgress += 0.085; // Ballistic eye movement (~120ms)
      if (this.saccadeProgress >= 1.0) {
        this.saccadeProgress = 1.0;
        this.isSaccading = false;
        this.currentGaze = { ...this.targetGaze };

        // Record fixation
        this.fixations.push({
          x: this.currentGaze.x,
          y: this.currentGaze.y,
          duration: 1,
          order: this.fixations.length + 1,
        });

        if (this.fixations.length > this.maxFixations) {
          this.fixations.shift();
        }
      } else {
        // Smoothstep ease for ballistic saccade
        const t = this.saccadeProgress;
        const ease = t * t * (3 - 2 * t);
        this.currentGaze.x = this.saccadeStart.x + (this.targetGaze.x - this.saccadeStart.x) * ease;
        this.currentGaze.y = this.saccadeStart.y + (this.targetGaze.y - this.saccadeStart.y) * ease;
      }
    } else {
      // Fixation Dwell
      this.currentDwell++;
      if (this.fixations.length > 0) {
        this.fixations[this.fixations.length - 1].duration++;
      }

      if (this.currentDwell > this.minDwellFrames) {
        this.findNextFixation();
      }
    }
  }

  reset() {
    this.inhibitionCenters = [];
    this.fixations = [];
    this.currentGaze = { x: this.width / 2, y: this.height / 2 };
    this.findNextFixation();
  }

  render(ctx) {
    if (this.fixations.length === 0) return;

    ctx.save();

    // 1. Draw Saccadic Scanpath Trail
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.75)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(this.fixations[0].x, this.fixations[0].y);
    for (let i = 1; i < this.fixations.length; i++) {
      ctx.lineTo(this.fixations[i].x, this.fixations[i].y);
    }
    if (this.isSaccading) {
      ctx.lineTo(this.currentGaze.x, this.currentGaze.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw Fixation Circles (radius proportional to duration)
    this.fixations.forEach((fix) => {
      const radius = Math.min(36, 12 + Math.sqrt(fix.duration) * 3);

      const grad = ctx.createRadialGradient(fix.x, fix.y, 2, fix.x, fix.y, radius);
      grad.addColorStop(0, 'rgba(212, 175, 55, 0.55)');
      grad.addColorStop(0.7, 'rgba(212, 175, 55, 0.18)');
      grad.addColorStop(1, 'rgba(212, 175, 55, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fix.x, fix.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(fix.x, fix.y, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Fixation order number
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${fix.order}`, fix.x, fix.y);
    });

    // 3. Current Live Gaze Point
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(this.currentGaze.x, this.currentGaze.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Crosshair ticks
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.9)';
    ctx.lineWidth = 1.5;
    const len = 9;
    ctx.beginPath();
    ctx.moveTo(this.currentGaze.x - len, this.currentGaze.y);
    ctx.lineTo(this.currentGaze.x + len, this.currentGaze.y);
    ctx.moveTo(this.currentGaze.x, this.currentGaze.y - len);
    ctx.lineTo(this.currentGaze.x, this.currentGaze.y + len);
    ctx.stroke();

    ctx.restore();
  }
}
