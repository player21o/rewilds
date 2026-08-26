import {GlProgram, Mesh, MeshGeometry, Shader, UniformGroup} from 'pixi.js';

const vertex = `
  precision highp float;

  in vec2 aPosition;
  in vec2 aUV;

  uniform mat3 uProjectionMatrix;
  uniform mat3 uWorldTransformMatrix;
  uniform mat3 uTransformMatrix;

  out vec2 vUV;

  void main(void) {
      mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
      gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
      vUV = aUV;
  }
`;

const fragment = `
  precision highp float;

  in vec2 vUV;
  out vec4 finalColor;

  uniform float uHealth;       // 0.0 to 1.0
  uniform float uStamina;      // 0.0 to 1.0
  uniform vec3  uHealthColor;  // RGB float (0.0 to 1.0)
  uniform float uHideStamina;  // 0.0 (show) or 1.0 (hide)
  uniform float uSize;         // Quad size in pixels (64.0)

  #define PI 3.14159265
  #define TWO_PI 6.2831853
  #define Y_SCALE 0.6

  // Original Wilds.io atan2 function (maps angle to [0.0, 2*PI])
  float atan2(float y, float x) {
      float s = abs(x) > abs(y) ? 1.0 : 0.0;
      float result = mix(PI / 2.0 - atan(x, y), atan(y, x), s);

      if (result < 0.0) return TWO_PI + result;
      else return result;
  }

  // Original Wilds.io loop/mod function
  float loop(float num, float maxVal) {
      if (num < 0.0) num = maxVal + num;
      else num = mod(num, maxVal);

      return num;
  }

  // Checks distance and angle bounds on the 0.6 Y-scaled coordinate space
  bool inArc(vec2 p, float rInner, float rOuter, float start, float len) {
      if (len <= 0.001) return false;
      
      float dist = length(p);
      if (dist < rInner || dist > rOuter) return false;

      float angle = atan2(p.y, p.x);
      float end = start + len;

      return (angle > start && angle < end);
  }

  void main(void) {
      // Coordinate p is centered at (0, 0) in pixels (+Y is downwards, +X is rightwards)
      vec2 p = (vUV - 0.5) * uSize;
      
      // Squash Y by 0.6 to match Wilds.io ground perspective
      vec2 pScaled = vec2(p.x, p.y / Y_SCALE);
      
      vec4 outColor = vec4(0.0);
      
      // ==========================================
      // 1. SHADOW (Ellipse at y = -1.0, radius = 12.0, alpha = 0.25)
      // ==========================================
      vec2 shadowP = vec2(p.x, (p.y + 1.0) / Y_SCALE);
      if (length(shadowP) <= 12.0) {
          vec4 shadowCol = vec4(0.0, 0.0, 0.0, 0.25);
          outColor = shadowCol + outColor * (1.0 - shadowCol.a);
      }
      
      // ==========================================
      // 2. STAMINA (Radius = 10.5, Thickness = 3.0 -> Inner = 9.0, Outer = 12.0)
      // ==========================================
      if (uHideStamina < 0.5) {
          // Track background: full bottom semicircle
          if (inArc(pScaled, 9.0, 12.0, 0.0, PI)) {
              vec4 stamBgCol = vec4(vec3(0.33333), 0.6); // 0x555555
              outColor = vec4(stamBgCol.rgb * stamBgCol.a, stamBgCol.a) + outColor * (1.0 - stamBgCol.a);
          }
          
          // Active stamina fill (white/pale blue)
          if (uStamina > 0.001) {
              float stamLen = clamp(uStamina, 0.0, 1.0) * PI;
              float stamStart = (PI / 2.0) - (stamLen * 0.5);
              if (inArc(pScaled, 9.0, 12.0, stamStart, stamLen)) {
                  vec4 stamFillCol = vec4(vec3(0.88, 0.92, 1.0), 1.0); // #e0eaff
                  outColor = stamFillCol + outColor * (1.0 - stamFillCol.a);
              }
          }
      }
      
      // ==========================================
      // 3. HEALTH BAR (Radius = 15.0, Thickness = 3.0 -> Inner = 13.5, Outer = 16.5)
      // ==========================================
      if (uHealth > 0.001) {
          // Track background: full bottom semicircle
          if (inArc(pScaled, 13.5, 16.5, 0.0, PI)) {
              vec4 healthBgCol = vec4(uHealthColor, 0.35);
              outColor = vec4(healthBgCol.rgb * healthBgCol.a, healthBgCol.a) + outColor * (1.0 - healthBgCol.a);
          }
          
          // Active health fill
          float healthLen = clamp(uHealth, 0.0, 1.0) * PI;
          float healthStart = (PI / 2.0) - (healthLen * 0.5);
          if (inArc(pScaled, 13.5, 16.5, healthStart, healthLen)) {
              vec4 healthCol = vec4(uHealthColor, 1.0);
              outColor = healthCol + outColor * (1.0 - healthCol.a);
          }
      }
      
      if (outColor.a <= 0.001) {
          discard;
      }
      
      finalColor = outColor;
  }
`;

export type BarMesh = Mesh<MeshGeometry, Shader>;

const size = 64;
const half = size / 2;

// Shared quad geometry for all citizens
const sharedQuadGeometry = new MeshGeometry({
  positions: new Float32Array([
    -half,
    -half,
    half,
    -half,
    half,
    half,
    -half,
    half,
  ]),
  uvs: new Float32Array([
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1,
  ]),
  indices: new Uint32Array([
    0,
    1,
    2,
    0,
    2,
    3,
  ]),
});

const sharedGlProgram = GlProgram.from({
  vertex,
  fragment,
  name: 'bars-sdf-program',
});

/**
 * Creates a unique BarMesh instance for a Citizen with its own UniformGroup.
 */
export function createBarMesh(): BarMesh {
  const barUniforms = new UniformGroup({
    uHealth: {value: 1.0, type: 'f32'},
    uStamina: {value: 1.0, type: 'f32'},
    uHealthColor: {
      value: [0.188, 0.549, 0.502],
      type: 'vec3<f32>'
    },  // #308c80 Wilds green
    uHideStamina: {value: 0.0, type: 'f32'},
    uSize: {value: size, type: 'f32'},
  });

  const shader = new Shader({
    glProgram: sharedGlProgram,
    resources: {
      barUniforms,
    },
  });

  const mesh = new Mesh({geometry: sharedQuadGeometry, shader});
  mesh.zIndex = 0;
  return mesh;
}