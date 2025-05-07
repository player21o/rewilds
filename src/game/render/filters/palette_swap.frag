in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform sampler2D uPalette;
uniform float uRow;

void main(void) {
  vec4 c = texture(uTexture, vTextureCoord);

  float colorIndex = floor(c.r * 32.0);

  vec2 paluv = vec2(colorIndex * (1.0 / 64.0), uRow * (1.0 / 64.0));

  float a = c.a;

  c = texture2D(uPalette, paluv);

  c.a = a;

  finalColor = c;
}