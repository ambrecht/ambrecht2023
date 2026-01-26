/**
 * Der Fragment-Shader ist ein spezieller Shader, der in WebGL und Three.js verwendet wird,
 * um die Farbe und andere Aspekte jedes Fragments (Pixels) auf dem Bildschirm zu berechnen.
 * Dieser spezielle Shader ist in GLSL (OpenGL Shading Language) geschrieben.
 */

export const fragment = `
// Definiert die Praezision der Fliesskommaoperationen
precision mediump float;

// Eine variierte Variable, die die Texturkoordinaten von jedem Vertex enthaelt
varying vec2 vUv;

// Uniform-Variable fuer die Zeit seit Beginn der Ausfuehrung
uniform float u_time;

// Uniform-Variable fuer die Aufloesung des Viewports
uniform vec2 u_resolution;

// Uniform-Variable fuer den Blitz-Effekt
uniform float u_flash;

// Uniform-Variable fuer die Textur, die auf die Geometrie angewendet werden soll
uniform sampler2D u_texture;

// Uniform-Variable fuer das Seitenverhaeltnis der Textur
uniform float u_textureAspect;

// Uniform-Variable fuer den Glitch-Seed
uniform float u_glitchSeed;

float rand(float n) {
  return fract(sin(n) * 43758.5453123);
}

float rand2(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 containUv(vec2 uv, float texAspect, float viewAspect) {
  if (viewAspect > texAspect) {
    float scale = texAspect / viewAspect;
    uv.x = (uv.x - 0.5) / scale + 0.5;
  } else {
    float scale = viewAspect / texAspect;
    uv.y = (uv.y - 0.5) / scale + 0.5;
  }
  return uv;
}

// Hauptfunktion, die fuer jedes Fragment aufgerufen wird
void main(){
  vec2 screenUv = vUv;
  float viewAspect = u_resolution.x / u_resolution.y;
  float texAspect = max(u_textureAspect, 0.0001);
  vec2 uv = containUv(screenUv, texAspect, viewAspect);

  float flash = clamp(u_flash, 0.0, 1.0);

  float zoom = 0.97 + 0.05 * sin(u_time * 0.06);
  uv = (uv - 0.5) * zoom + 0.5;
  uv += vec2(sin(u_time * 0.045), cos(u_time * 0.038)) * 0.02;
  uv.y += sin(u_time * 0.35 + screenUv.x * 4.0) * 0.004;

  float inside = step(0.0, uv.x) * step(0.0, uv.y) * step(uv.x, 1.0) * step(uv.y, 1.0);

  float line = floor(screenUv.y * 240.0);
  float lineRand = rand(line + u_glitchSeed * 91.7);
  float lineOffset = (lineRand - 0.5) * 0.08 * flash;
  float vJitter = (rand(u_time * 2.1 + u_glitchSeed) - 0.5) * 0.01 * flash;

  vec2 glitchUv = uv;
  glitchUv.x += lineOffset;
  glitchUv.y += vJitter;

  vec2 block = vec2(220.0, 140.0);
  vec2 blockUv = floor(glitchUv * block) / block;
  glitchUv = mix(glitchUv, blockUv, flash * 0.7);

  vec2 chroma = vec2(0.003, 0.0) + vec2(flash * 0.01, 0.0);

  vec3 col;
  col.r = texture2D(u_texture, glitchUv + chroma).r;
  col.g = texture2D(u_texture, glitchUv).g;
  col.b = texture2D(u_texture, glitchUv - chroma).b;

  col = clamp(col * 0.5 + 0.5 * col * col * 1.2, 0.0, 1.0);

  float grain = rand2(screenUv * u_resolution.xy + u_time * 60.0);
  col += (grain - 0.5) * 0.03;

  float brightness = 0.5;
  col *= brightness + 0.5 * 16.0 * screenUv.x * screenUv.y * (1.0 - screenUv.x) * (screenUv.y);

  float s = step(sin(u_time / 8.0), 0.0);
  float alt = 10.0 * u_time + screenUv.y * s * 100.0;
  if (s <= 0.5){
    alt = 10.0 * u_time + screenUv.y * 800.0;
  }

  col *= 0.9 + 0.1 * sin(alt);
  col *= 0.99 + 0.01 * sin(110.0 * u_time);

  col.r *= 1.1;
  col.b = col.b * 1.05;

  col += flash * vec3(0.18, 0.2, 0.22);
  col = mix(col, vec3(1.0), flash * 0.08);

  float borderNoise = rand2(screenUv * u_resolution.xy * 0.75 + u_time * 90.0);
  float borderScan = 0.85 + 0.15 * sin(u_time * 30.0 + screenUv.y * 900.0);
  vec3 borderCol = vec3(0.04 + borderNoise * 0.2) * borderScan;
  borderCol += flash * 0.08;

  col = mix(borderCol, col, inside);

  gl_FragColor = vec4(col - 0.05, 1.0);
}
`;
