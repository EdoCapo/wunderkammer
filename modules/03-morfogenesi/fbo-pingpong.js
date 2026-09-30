/**
 * Wunderkammer — Room 03: WebGL 2 Ping-Pong FBO Manager
 */

export const vertexShaderSource = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export class PingPongFBO {
  /**
   * @param {WebGL2RenderingContext} gl 
   * @param {number} width 
   * @param {number} height 
   */
  constructor(gl, width, height) {
    this.gl = gl;
    this.width = width;
    this.height = height;

    this.textures = [];
    this.framebuffers = [];
    this.current = 0;

    this.init();
  }

  init() {
    const gl = this.gl;

    // Check float texture support
    gl.getExtension('EXT_color_buffer_float');

    // Create 2 textures and 2 framebuffers for ping-pong swapping
    for (let i = 0; i < 2; i++) {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // Try RGBA32F, with fallback to RGBA16F or RGBA
      let internalFormat = gl.RGBA32F;
      let type = gl.FLOAT;

      if (!gl.getExtension('EXT_color_buffer_float')) {
        internalFormat = gl.RGBA;
        type = gl.UNSIGNED_BYTE;
      }

      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        this.width,
        this.height,
        0,
        gl.RGBA,
        type,
        null
      );

      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        tex,
        0
      );

      this.textures.push(tex);
      this.framebuffers.push(fbo);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.seedInitialConditions();
  }

  seedInitialConditions() {
    const gl = this.gl;
    const size = this.width * this.height;
    const data = new Float32Array(size * 4);

    // Initial state: U = 1.0, V = 0.0 everywhere
    for (let i = 0; i < size; i++) {
      data[i * 4] = 1.0;     // U
      data[i * 4 + 1] = 0.0; // V
      data[i * 4 + 2] = 0.0;
      data[i * 4 + 3] = 1.0;
    }

    // Seed multiple random reactant spots (V = 1.0, U = 0.5)
    const numSeeds = 16;
    for (let s = 0; s < numSeeds; s++) {
      const cx = Math.floor(Math.random() * this.width);
      const cy = Math.floor(Math.random() * this.height);
      const radius = Math.floor(Math.random() * 12 + 6);

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy <= radius * radius) {
            const x = (cx + dx + this.width) % this.width;
            const y = (cy + dy + this.height) % this.height;
            const idx = (y * this.width + x) * 4;
            data[idx] = 0.5;     // U
            data[idx + 1] = 0.85; // V
          }
        }
      }
    }

    // Upload to both textures
    for (let i = 0; i < 2; i++) {
      gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        this.width,
        this.height,
        gl.RGBA,
        gl.FLOAT,
        data
      );
    }
  }

  swap() {
    this.current = 1 - this.current;
  }

  get readTexture() {
    return this.textures[this.current];
  }

  get writeFramebuffer() {
    return this.framebuffers[1 - this.current];
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.init();
  }
}

/**
 * Creates and compiles a WebGL program
 */
export function createProgram(gl, vsSource, fsSource) {
  function compileShader(src, type) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  const vs = compileShader(vsSource, gl.VERTEX_SHADER);
  const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
  const prog = gl.createProgram();

  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(prog));
    return null;
  }

  return prog;
}
