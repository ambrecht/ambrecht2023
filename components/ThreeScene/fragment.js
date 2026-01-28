const fragment = `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_flash;
  uniform sampler2D u_texture;
  void main(){

    vec2 q = gl_FragCoord.xy / u_resolution.xy;
    vec2 uv = 0.5 + (q - 0.5) * (0.9 + 0.1 * sin(0.2 * u_time / 5.0));
    vec3 col;

    vec2 newRes = vec2(512.0);
    vec3 pal = vec3(6.0,6.0,6.0);


    if (u_flash > 0.0){
      uv = floor(uv * newRes) / newRes;
      col = texture2D(u_texture, uv).xyz;

    }
     else {
      col.r = texture2D(u_texture, vec2(uv.x + 0.003, uv.y)).x;
      col.g = texture2D(u_texture, vec2(uv.x + 0.00, uv.y)).y;
      col.b = texture2D(u_texture, vec2(uv.x - 0.003, uv.y)).z;
     }

    

    

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

    // offset colors a bit
    if (u_flash > 0.0){
      col.g = col.g * sin(u_flash * 50000.0) - cos(u_time);
      col.xyz = floor(col.xyz * pal) / pal.xyz;
      gl_FragColor = vec4(col - 0.5, 1.0);
    }
    else {
      gl_FragColor = vec4(col - 0.05, 1.0);
    }
    
    

    

    
  }
`;

export default fragment;
