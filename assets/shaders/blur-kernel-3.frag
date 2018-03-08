precision mediump float;

uniform sampler2D sBackBuffer;

uniform vec2 uInvSize;
uniform vec2 uScale;

varying vec2 vTexCoord;

const float w0 = 2.0;
const float w1 = 1.0;
const float w = 4.0;

void main() {
  vec2 d = uScale;
  vec2 s = uInvSize;
  vec3 n1 = texture2D(sBackBuffer, vTexCoord - d * s).rgb * w1;
  vec3 c = texture2D(sBackBuffer, vTexCoord).rgb * w0;
  vec3 p1 = texture2D(sBackBuffer, vTexCoord + d * s).rgb * w1;
  vec3 color = (n1 + c + p1) / vec3(w);

  gl_FragColor = vec4(color, 1.0);
}
