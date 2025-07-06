in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform sampler2D uPalette;

uniform float uPaletteY;
uniform float uPaletteStepX; 

void main(void) {
  vec4 sourceColor = texture(uTexture, vTextureCoord);

  float colorIndex = floor(sourceColor.r * 32.0);

  vec2 paletteUV = vec2(colorIndex * uPaletteStepX, uPaletteY);

  vec4 finalRGB = texture(uPalette, paletteUV);

  finalColor = vec4(finalRGB.rgb, sourceColor.a);
}