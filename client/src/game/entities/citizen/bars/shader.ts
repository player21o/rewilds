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

  #define PI 3.14159265359
  #define TAU 6.28318530718

  // Original Wilds.io atan2 method (returns angle in [0, TAU])
  float atan2(float y, float x) {
      float s = abs(x) > abs(y) ? 1.0 : 0.0;
      float result = mix(PI / 2.0 - atan(x, y), atan(y, x), s);

      if (result < 0.0) return TAU + result;
      else return result;
  }

  // Original Wilds.io circle & arc test: dist < outer && dist >= inner && angle in [start, start + length]
  bool inArc(float dist, float angle, float outerRadius, float innerRadius, float start, float length) {
      float end = start + length;
      return dist < outerRadius && dist >= innerRadius && angle >= start && angle <= end;
  }

  void main(void) {
      // Coordinate p centered at (0, 0) in pixels (+Y is downwards, +X is right)
      vec2 p = (vUV - 0.5) * uSize;
      
      float dist = sqrt(dot(p, p));
      float angle = atan2(p.y, p.x);
      
      vec4 outColor = vec4(0.0);
      
      // ==========================================
      // 1. SHADOW (Full disk at y = -1.0, radius = 12.0, alpha = 0.25)
      // ==========================================
      vec2 shadowP = p - vec2(0.0, -1.0);
      float shadowDist = sqrt(dot(shadowP, shadowP));
      if (shadowDist < 12.0) {
          vec4 shadowCol = vec4(0.0, 0.0, 0.0, 0.25);
          outColor = shadowCol + outColor * (1.0 - shadowCol.a);
      }
      
      // ==========================================
      // 2. STAMINA (Radius = 10.5, Thickness = 3.0 -> Outer = 12.0, Inner = 9.0)
      // ==========================================
      if (uHideStamina < 0.5) {
          // Track background: bottom semicircle from angle 0 to PI
          if (inArc(dist, angle, 12.0, 9.0, 0.0, PI)) {
              vec4 stamBgCol = vec4(vec3(0.33333), 1.0); // 0x555555
              outColor = stamBgCol + outColor * (1.0 - stamBgCol.a);
          }
          
          // Active stamina fill: bottom-centered symmetrical arc
          if (uStamina > 0.001) {
              float stamArc = clamp(uStamina, 0.0, 1.0) * PI;
              float stamStart = (PI - stamArc) * 0.5;
              if (inArc(dist, angle, 12.0, 9.0, stamStart, stamArc)) {
                  vec4 stamFillCol = vec4(vec3(1.0), 1.0); // 0xffffff
                  outColor = stamFillCol + outColor * (1.0 - stamFillCol.a);
              }
          }
      }
      
      // ==========================================
      // 3. HEALTH BAR (Radius = 15.0, Thickness = 3.0 -> Outer = 16.5, Inner = 13.5)
      // ==========================================
      if (uHealth > 0.001) {
          float healthArc = clamp(uHealth, 0.0, 1.0) * PI;
          float healthStart = (PI - healthArc) * 0.5;
          if (inArc(dist, angle, 16.5, 13.5, healthStart, healthArc)) {
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
    uHealthColor: {value: [0.2157, 0.5804, 0.4314], type: 'vec3<f32>'},
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