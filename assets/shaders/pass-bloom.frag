precision mediump float;

uniform sampler2D sBackBuffer;
uniform float uIntensity;

varying vec2 vTexCoord;

void main() {
  gl_FragColor = texture2D(sBackBuffer, vTexCoord) * vec4(1.0, 1.0, 1.0, uIntensity);
}
