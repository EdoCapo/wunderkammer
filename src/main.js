/**
 * Wunderkammer — Atmospheric Ambient Engine for the Home Hub
 * Draws faint golden dust motes, celestial optics, and subtle constellation lines
 */

const canvas = document.getElementById('ambientCanvas');
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

const PARTICLES_COUNT = 45;
const particles = [];

let mouse = { x: width / 2, y: height / 2, active: false };

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});

window.addEventListener('mouseleave', () => {
  mouse.active = false;
});

// Initialize Particle Motes
for (let i = 0; i < PARTICLES_COUNT; i++) {
  particles.push({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    radius: Math.random() * 1.6 + 0.6,
    baseAlpha: Math.random() * 0.35 + 0.1,
    alpha: 0.2,
    period: Math.random() * 200 + 100,
  });
}

let tick = 0;

function animate() {
  tick++;
  ctx.clearRect(0, 0, width, height);

  // Subtle rotating optical circle around center
  const centerX = width / 2;
  const centerY = height * 0.32;
  const ringRadius = Math.min(width, height) * 0.28;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(tick * 0.0005);

  ctx.beginPath();
  ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.035)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 12]);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, ringRadius * 0.7, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.02)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 8]);
  ctx.stroke();

  ctx.restore();

  // Draw and update particle motes
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;

    // React to mouse
    if (mouse.active) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        p.x -= (dx / dist) * 0.8;
        p.y -= (dy / dist) * 0.8;
      }
    }

    const pulsatingAlpha = p.baseAlpha + Math.sin((tick + i * 20) / 40) * 0.12;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212, 175, 55, ${Math.max(0.05, pulsatingAlpha)})`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Connect close neighbors
    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dX = p.x - p2.x;
      const dY = p.y - p2.y;
      const d = Math.sqrt(dX * dX + dY * dY);

      if (d < 110) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(212, 175, 55, ${(1 - d / 110) * 0.08})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
}

animate();
