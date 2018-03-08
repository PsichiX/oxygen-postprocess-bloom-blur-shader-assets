precision mediump float;

uniform sampler2D sBackBuffer;
uniform sampler2D sMipmap0;
uniform sampler2D sMipmap1;
uniform sampler2D sMipmap2;
uniform sampler2D sMipmap3;

uniform float uIntensity;
uniform float uTreshold;
uniform vec4 uWeights;

varying vec2 vTexCoord;

void main() {
  vec3 c = texture2D(sBackBuffer, vTexCoord).rgb;
  vec3 c0 = texture2D(sMipmap0, vTexCoord).rgb;
  vec3 c1 = texture2D(sMipmap1, vTexCoord).rgb;
  vec3 c2 = texture2D(sMipmap2, vTexCoord).rgb;
  vec3 c3 = texture2D(sMipmap3, vTexCoord).rgb;
  vec3 color = c0 * uWeights.x + c1 * uWeights.y + c2 * uWeights.z + c3 * uWeights.w;

  gl_FragColor = vec4(
    mix(c, color, step(uTreshold, c) * clamp(0.0, 1.0, uIntensity)),
    1.0
  );
}
