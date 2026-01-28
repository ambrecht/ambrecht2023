const fragment = `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_flash;
  uniform float u_glitchSeed;
  uniform sampler2D u_texture;
  float rand(float n) {
    return fract(sin(n) * 43758.5453123);
  }
  void main(){

    vec2 q = gl_FragCoord.xy / u_resolution.xy;
    vec2 uv = 0.5 + (q - 0.5) * (0.9 + 0.1 * sin(0.2 * u_time / 5.0));
    vec3 col;

    float flash = clamp(u_flash, 0.0, 1.0);

    float line = floor(q.y * 240.0);
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

    col.r = texture2D(u_texture, glitchUv + chroma).r;
    col.g = texture2D(u_texture, glitchUv).g;
    col.b = texture2D(u_texture, glitchUv - chroma).b;

    

    

    col = clamp(col * 0.5 + 0.5 * col * col * 1.2, 0.0, 1.0);

    float brightness = 0.5;
    col *= brightness + 0.5 * 16.0 * uv.x * uv.y * (1.0 - uv.x) * (uv.y);
    
  
    float s = step(sin(u_time / 8.0), 0.0);

    float alt = 10.0 * u_time + uv.y * s * 100.0;

    // change scan lines a bit 
    if (s <= 0.5){
      alt = 10.0 * u_time + uv.y * 800.0;
    }

    col *= 0.9 + 0.1 * sin(alt);    
    col *= 0.99 + 0.01 * sin(110.0 * u_time);
    col.r *= 1.1;
    // make things a bit more blue
    col.b = col.b * 1.05;

    col += flash * vec3(0.18, 0.2, 0.22);
    col = mix(col, vec3(1.0), flash * 0.08);
    gl_FragColor = vec4(col - 0.05, 1.0);
    
    

    

    
  }
`;

export default fragment;
