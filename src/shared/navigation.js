/**
 * Wunderkammer — Shared Navigation & Room Header Runtime
 */

export class RoomHeader {
  /**
   * @param {Object} options
   * @param {string} options.roomNumber e.g. "01"
   * @param {string} options.roomTitle e.g. "L'Atelier dei Pigmenti Perduti"
   * @param {string} [options.badgeText] e.g. "KUBELKA-MUNK"
   * @param {string} [options.statusText] e.g. "ACTIVE"
   */
  constructor({ roomNumber, roomTitle, badgeText = 'ACTIVE', statusText = 'ONLINE' }) {
    this.roomNumber = roomNumber;
    this.roomTitle = roomTitle;
    this.badgeText = badgeText;
    this.statusText = statusText;

    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsElement = null;

    this.render();
    this.startFPSMeter();
  }

  render() {
    const existingHeader = document.querySelector('.wk-header');
    if (existingHeader) existingHeader.remove();

    const header = document.createElement('header');
    header.className = 'wk-header';
    header.innerHTML = `
      <a href="../../index.html" class="wk-back-link" title="Torna alla Wunderkammer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>Archivio</span>
      </a>

      <div class="wk-room-title">
        <span>${this.roomNumber}. ${this.roomTitle}</span>
        ${this.badgeText ? `<span class="wk-room-badge">${this.badgeText}</span>` : ''}
      </div>

      <div class="wk-status-hud">
        <div class="wk-status-item">
          <div class="wk-pulse-dot"></div>
          <span>${this.statusText}</span>
        </div>
        <div class="wk-status-item">
          <span class="wk-fps-counter" id="wkFpsVal">60</span>
          <span>FPS</span>
        </div>
      </div>
    `;

    document.body.prepend(header);
    this.fpsElement = document.getElementById('wkFpsVal');
  }

  startFPSMeter() {
    const measure = (now) => {
      this.frameCount++;
      const delta = now - this.lastTime;

      if (delta >= 500) {
        this.fps = Math.round((this.frameCount * 1000) / delta);
        if (this.fpsElement) {
          this.fpsElement.textContent = this.fps;
          if (this.fps < 30) {
            this.fpsElement.style.color = 'var(--accent-crimson)';
          } else if (this.fps < 50) {
            this.fpsElement.style.color = 'var(--accent-amber)';
          } else {
            this.fpsElement.style.color = 'var(--cyan-diagnostic)';
          }
        }
        this.frameCount = 0;
        this.lastTime = now;
      }

      requestAnimationFrame(measure);
    };

    requestAnimationFrame(measure);
  }
}

export function initRoomHeader(options) {
  return new RoomHeader(options);
}
