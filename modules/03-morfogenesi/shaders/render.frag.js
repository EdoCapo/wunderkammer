/**
 * Wunderkammer — Room 03: Render Fragment Shader
 * Maps chemical concentration to aesthetic Renaissance color palettes
 */

export const renderFragShader = `#version 300 es
precision highp float;

uniform sampler2D u_stateTexture;
uniform vec2 u_resolution;
uniform int u_paletteMode; // 0: Oro Antico, 1: Lapislazzuli, 2: Alchemico Smeraldo, 3: Cinabro Barocco

out vec4 fragColor;

vec3 getPaletteColor(float v, float u, int mode) {
  // Mode 0: Oro Antico & Legno Scuro
  if (mode == 0) {
    vec3 c0 = vec3(0.04, 0.04, 0.05); // Void black
    vec3 c1 = vec3(0.42, 0.28, 0.12); // Raw umber
    vec3 c2 = vec3(0.83, 0.68, 0.22); // Byzantine gold
    vec3 c3 = vec3(1.00, 0.94, 0.72); // Specular bone white
    
    if (v < 0.25) return mix(c0, c1, v * 4.0);
    if (v < 0.65) return mix(c1, c2, (v - 0.25) / 0.4);
    return mix(c2, c3, (v - 0.65) / 0.35);
  }
  
  // Mode 1: Lapislazzuli & Ciano Etereo
  if (mode == 1) {
    vec3 c0 = vec3(0.03, 0.05, 0.08);
    vec3 c1 = vec3(0.08, 0.18, 0.52);
    vec3 c2 = vec3(0.00, 0.85, 0.95);
    vec3 c3 = vec3(0.85, 0.98, 1.00);

    if (v < 0.3) return mix(c0, c1, v / 0.3);
    if (v < 0.7) return mix(c1, c2, (v - 0.3) / 0.4);
    return mix(c2, c3, (v - 0.7) / 0.3);
  }

  // Mode 2: Alchemico Smeraldo & Rame
  if (mode == 2) {
    vec3 c0 = vec3(0.02, 0.06, 0.04);
    vec3 c1 = vec3(0.10, 0.55, 0.32);
    vec3 c2 = vec3(0.45, 0.88, 0.48);
    vec3 c3 = vec3(0.92, 0.98, 0.85);

    if (v < 0.3) return mix(c0, c1, v / 0.3);
    if (v < 0.7) return mix(c1, c2, (v - 0.3) / 0.4);
    return mix(c2, c3, (v - 0.7) / 0.3);
  }

  // Mode 3: Cinabro & Cremisi Barocco
  vec3 c0 = vec3(0.06, 0.02, 0.03);
  vec3 c1 = vec3(0.65, 0.12, 0.14);
  vec3 c2 = vec3(0.92, 0.42, 0.18);
  vec3 c3 = vec3(1.00, 0.90, 0.75);

  if (v < 0.3) return mix(c0, c1, v / 0.3);
  if (v < 0.7) return mix(c1, c2, (v - 0.3) / 0.4);
  return mix(c2, c3, (v - 0.7) / 0.3);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec4 state = texture(u_stateTexture, uv);
  float u = state.r;
  float v = state.g;

  // Enhance fine filaments
  float displayVal = smoothstep(0.05, 0.65, v);
  vec3 col = getPaletteColor(displayVal, u, u_paletteMode);

  // Subtle shading relief / fake normal map highlight based on neighboring gradient
  vec2 px = 1.0 / u_resolution;
  float vRight = texture(u_stateTexture, uv + vec2(px.x, 0.0)).g;
  float vTop   = texture(u_stateTexture, uv + vec2(0.0, px.y)).g;
  vec2 normalXY = vec2(v - vRight, v - vTop);
  float light = dot(normalize(vec3(normalXY, 0.15)), normalize(vec3(0.5, 0.5, 1.0)));
  col *= (0.75 + 0.35 * max(0.0, light));

  fragColor = vec4(col, 1.0);
}
`;
