precision mediump float;

uniform sampler2D sBackBuffer;

varying vec2 vTexCoord;

void main() {
  gl_FragColor = texture2D(sBackBuffer, vTexCoord);
}
