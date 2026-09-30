/**
 * Wunderkammer — Room 03: Gray-Scott Simulation Fragment Shader (GLSL 300 es)
 */

export const grayScottFragShader = `#version 300 es
precision highp float;

uniform sampler2D u_stateTexture;
uniform vec2 u_resolution;
uniform float u_dt;
uniform float u_diffU;
uniform float u_diffV;
uniform float u_feed;
uniform float u_kill;

uniform vec2 u_mouse;
uniform float u_brushRadius;
uniform float u_brushIntensity;
uniform bool u_mouseDown;

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 px = 1.0 / u_resolution;

  // Read current chemical concentrations: r = U, g = V
  vec4 center = texture(u_stateTexture, uv);
  float u = center.r;
  float v = center.g;

  // 9-point Laplacian stencil for high spatial isotropy
  // Center weight: -1.0, Orthogonal: 0.2, Diagonal: 0.05
  vec4 top    = texture(u_stateTexture, uv + vec2(0.0, px.y));
  vec4 bottom = texture(u_stateTexture, uv - vec2(0.0, px.y));
  vec4 left   = texture(u_stateTexture, uv - vec2(px.x, 0.0));
  vec4 right  = texture(u_stateTexture, uv + vec2(px.x, 0.0));

  vec4 tr = texture(u_stateTexture, uv + vec2(px.x, px.y));
  vec4 tl = texture(u_stateTexture, uv + vec2(-px.x, px.y));
  vec4 br = texture(u_stateTexture, uv + vec2(px.x, -px.y));
  vec4 bl = texture(u_stateTexture, uv + vec2(-px.x, -px.y));

  vec2 laplacian = (
    (top.rg + bottom.rg + left.rg + right.rg) * 0.2 +
    (tr.rg + tl.rg + br.rg + bl.rg) * 0.05 -
    center.rg
  );

  // Gray-Scott Reaction Equations
  float uv2 = u * v * v;
  float du = u_diffU * laplacian.r - uv2 + u_feed * (1.0 - u);
  float dv = u_diffV * laplacian.g + uv2 - (u_feed + u_kill) * v;

  float nextU = clamp(u + du * u_dt, 0.0, 1.0);
  float nextV = clamp(v + dv * u_dt, 0.0, 1.0);

  // Mouse disturbance injection
  if (u_mouseDown) {
    float dist = length(gl_FragCoord.xy - u_mouse);
    if (dist < u_brushRadius) {
      float factor = smoothstep(u_brushRadius, 0.0, dist) * u_brushIntensity;
      nextV = clamp(nextV + factor, 0.0, 1.0);
      nextU = clamp(nextU - factor * 0.5, 0.0, 1.0);
    }
  }

  fragColor = vec4(nextU, nextV, 0.0, 1.0);
}
`;
