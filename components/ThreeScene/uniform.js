export const createUniforms = (Vector2Ctor) => {
  return {
    u_time: { type: '1f', value: 1.0 },
    u_resolution: {
      type: 'v2',
      value: new Vector2Ctor(1, 1),
    },
    u_texture: { type: 't', value: null },
    u_flash: { type: '1f', value: 0.0 },
    u_glitchSeed: { type: '1f', value: 0.0 },
    u_textureAspect: { type: '1f', value: 1.0 },

    // NEU: >1 = zoom-in, 1 = normal
    u_zoom: { type: '1f', value: 3.0 },
  };
};
