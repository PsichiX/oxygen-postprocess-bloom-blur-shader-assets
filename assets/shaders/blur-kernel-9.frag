precision mediump float;

uniform sampler2D sBackBuffer;

uniform vec2 uInvSize;
uniform vec2 uScale;

varying vec2 vTexCoord;

const float w0 = 70.0;
const float w1 = 56.0;
const float w2 = 28.0;
const float w3 = 8.0;
const float w4 = 1.0;
const float w = 256.0;

void main() {
  vec2 d = uScale;
  vec2 s = uInvSize;
  vec3 n4 = texture2D(sBackBuffer, vTexCoord - d * s * 4.0).rgb * w4;
  vec3 n3 = texture2D(sBackBuffer, vTexCoord - d * s * 3.0).rgb * w3;
  vec3 n2 = texture2D(sBackBuffer, vTexCoord - d * s * 2.0).rgb * w2;
  vec3 n1 = texture2D(sBackBuffer, vTexCoord - d * s).rgb * w1;
  vec3 c = texture2D(sBackBuffer, vTexCoord).rgb * w0;
  vec3 p1 = texture2D(sBackBuffer, vTexCoord + d * s).rgb * w1;
  vec3 p2 = texture2D(sBackBuffer, vTexCoord + d * s * 2.0).rgb * w2;
  vec3 p3 = texture2D(sBackBuffer, vTexCoord + d * s * 3.0).rgb * w3;
  vec3 p4 = texture2D(sBackBuffer, vTexCoord + d * s * 4.0).rgb * w4;
  vec3 color = (n4 + n3 + n2 + n1 + c + p1 + p2 + p3 + p4) / vec3(w);

  gl_FragColor = vec4(color, 1.0);
}
