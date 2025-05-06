in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
//uniform sampler2D uPalette;
uniform float uRed;

void main(void) {
  vec4 c = texture(uTexture, vTextureCoord);
  finalColor = vec4(uRed, 0, 0, c.a);
}