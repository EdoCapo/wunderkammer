import { initRoomHeader } from '../../src/shared/navigation.js';
import {
  PingPongFBO,
  createProgram,
  vertexShaderSource,
} from './fbo-pingpong.js';
import { grayScottFragShader } from './shaders/gray-scott.frag.js';
import { renderFragShader } from './shaders/render.frag.js';

// 1. Initialize Room Header
initRoomHeader({
  roomNumber: '03',
  roomTitle: 'Morfogenesi su Tela',
  badgeText: 'GRAY-SCOTT WEBGL2',
  statusText: 'DIFFUSING',
});

// Canvas & WebGL2 context
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true });

if (!gl) {
  alert('WebGL 2 non supportato da questo browser.');
}

// Fullscreen quad geometry
const quadVAO = gl.createVertexArray();
gl.bindVertexArray(quadVAO);

const quadBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ]),
  gl.STATIC_DRAW
);

gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

// Programs
const simProgram = createProgram(gl, vertexShaderSource, grayScottFragShader);
const renderProgram = createProgram(gl, vertexShaderSource, renderFragShader);

// Simulation Uniform Locations
const uSimState = gl.getUniformLocation(simProgram, 'u_stateTexture');
const uSimRes = gl.getUniformLocation(simProgram, 'u_resolution');
const uSimDt = gl.getUniformLocation(simProgram, 'u_dt');
const uSimDiffU = gl.getUniformLocation(simProgram, 'u_diffU');
const uSimDiffV = gl.getUniformLocation(simProgram, 'u_diffV');
const uSimFeed = gl.getUniformLocation(simProgram, 'u_feed');
const uSimKill = gl.getUniformLocation(simProgram, 'u_kill');
const uSimMouse = gl.getUniformLocation(simProgram, 'u_mouse');
const uSimBrushRad = gl.getUniformLocation(simProgram, 'u_brushRadius');
const uSimBrushInt = gl.getUniformLocation(simProgram, 'u_brushIntensity');
const uSimMouseDown = gl.getUniformLocation(simProgram, 'u_mouseDown');

// Render Uniform Locations
const uRenState = gl.getUniformLocation(renderProgram, 'u_stateTexture');
const uRenRes = gl.getUniformLocation(renderProgram, 'u_resolution');
const uRenPalette = gl.getUniformLocation(renderProgram, 'u_paletteMode');

// Dimensions and PingPong FBO
let simWidth = 512;
let simHeight = 512;
let fbo = new PingPongFBO(gl, simWidth, simHeight);

function resize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = Math.floor(rect.width);
  canvas.height = Math.floor(rect.height);

  simWidth = Math.min(800, canvas.width);
  simHeight = Math.min(600, canvas.height);

  fbo = new PingPongFBO(gl, simWidth, simHeight);
}

resize();
window.addEventListener('resize', resize);

// Simulation State Variables
let feed = 0.0545;
let kill = 0.062;
let diffU = 0.2097;
let diffV = 0.105;
let dt = 1.0;
let stepsPerFrame = 10;
let paletteMode = 0;

let brushRadius = 24.0;
let brushIntensity = 0.85;
let isMouseDown = false;
let mouseX = simWidth / 2;
let mouseY = simHeight / 2;

// Mouse Interaction Handlers
canvas.addEventListener('mousedown', (e) => {
  isMouseDown = true;
  updateMousePos(e);
});

window.addEventListener('mousemove', (e) => {
  if (isMouseDown) {
    updateMousePos(e);
  }
});

window.addEventListener('mouseup', () => {
  isMouseDown = false;
});

function updateMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  const normX = (e.clientX - rect.left) / rect.width;
  const normY = 1.0 - (e.clientY - rect.top) / rect.height; // WebGL Y is inverted
  mouseX = normX * simWidth;
  mouseY = normY * simHeight;
}

// Main Simulation & Rendering Loop
function animate() {
  // 1. Simulation Ping-Pong Steps
  gl.useProgram(simProgram);
  gl.bindVertexArray(quadVAO);

  gl.uniform2f(uSimRes, simWidth, simHeight);
  gl.uniform1f(uSimDt, dt);
  gl.uniform1f(uSimDiffU, diffU);
  gl.uniform1f(uSimDiffV, diffV);
  gl.uniform1f(uSimFeed, feed);
  gl.uniform1f(uSimKill, kill);
  gl.uniform2f(uSimMouse, mouseX, mouseY);
  gl.uniform1f(uSimBrushRad, brushRadius);
  gl.uniform1f(uSimBrushInt, brushIntensity);
  gl.uniform1i(uSimMouseDown, isMouseDown ? 1 : 0);

  gl.viewport(0, 0, simWidth, simHeight);

  for (let i = 0; i < stepsPerFrame; i++) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.writeFramebuffer);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbo.readTexture);
    gl.uniform1i(uSimState, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    fbo.swap();
  }

  // 2. Render to Screen with Palette & Relief Lighting
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.useProgram(renderProgram);
  gl.uniform2f(uRenRes, canvas.width, canvas.height);
  gl.uniform1i(uRenPalette, paletteMode);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, fbo.readTexture);
  gl.uniform1i(uRenState, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  requestAnimationFrame(animate);
}

animate();

// UI Wiring: Presets
document.querySelectorAll('.wk-preset-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.wk-preset-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    feed = parseFloat(btn.dataset.f);
    kill = parseFloat(btn.dataset.k);

    sliderF.value = (feed * 1000).toFixed(1);
    sliderK.value = (kill * 1000).toFixed(1);

    valF.textContent = feed.toFixed(4);
    valK.textContent = kill.toFixed(4);
  });
});

// UI Wiring: Palettes
document.querySelectorAll('.wk-palette-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.wk-palette-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    paletteMode = parseInt(btn.dataset.palette);
  });
});

// UI Wiring: Sliders
const sliderF = document.getElementById('sliderF');
const sliderK = document.getElementById('sliderK');
const sliderSteps = document.getElementById('sliderSteps');
const sliderBrush = document.getElementById('sliderBrush');

const valF = document.getElementById('valF');
const valK = document.getElementById('valK');
const valSteps = document.getElementById('valSteps');
const valBrush = document.getElementById('valBrush');

sliderF.addEventListener('input', (e) => {
  feed = parseFloat(e.target.value) / 1000;
  valF.textContent = feed.toFixed(4);
});

sliderK.addEventListener('input', (e) => {
  kill = parseFloat(e.target.value) / 1000;
  valK.textContent = kill.toFixed(4);
});

sliderSteps.addEventListener('input', (e) => {
  stepsPerFrame = parseInt(e.target.value);
  valSteps.textContent = `${stepsPerFrame}x`;
});

sliderBrush.addEventListener('input', (e) => {
  brushRadius = parseFloat(e.target.value);
  valBrush.textContent = `${Math.round(brushRadius)}px`;
});

// Buttons
document.getElementById('btnReSeed').addEventListener('click', () => {
  fbo.seedInitialConditions();
});

document.getElementById('btnClear').addEventListener('click', () => {
  // Reset all to U = 1, V = 0
  const size = simWidth * simHeight;
  const blank = new Float32Array(size * 4);
  for (let i = 0; i < size; i++) {
    blank[i * 4] = 1.0;
    blank[i * 4 + 1] = 0.0;
    blank[i * 4 + 2] = 0.0;
    blank[i * 4 + 3] = 1.0;
  }
  for (let i = 0; i < 2; i++) {
    gl.bindTexture(gl.TEXTURE_2D, fbo.textures[i]);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, simWidth, simHeight, gl.RGBA, gl.FLOAT, blank);
  }
});

document.getElementById('btnExport').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `wunderkammer-morfogenesi-F${feed.toFixed(4)}-k${kill.toFixed(4)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});
