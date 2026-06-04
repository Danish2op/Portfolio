import { MeshBasicMaterial } from 'three';

/**
 * RevealBasicMaterial injects a 2D brush-stroke alpha discard shader
 * into the standard MeshBasicMaterial.
 */
export class RevealBasicMaterial extends MeshBasicMaterial {
  public uProgress: { value: number };

  constructor(parameters = {}) {
    super(parameters);
    this.uProgress = { value: 0.0 };
    this.transparent = true;
    this.alphaTest = 0.01;
  }

  onBeforeCompile(shader: any) {
    shader.uniforms.uProgress = this.uProgress;

    // Inject uniforms and noise functions
    shader.fragmentShader = `
      uniform float uProgress;

      float revealRand(vec2 n) { 
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
      }

      float revealNoise(vec2 p) {
          vec2 ip = floor(p);
          vec2 u = fract(p);
          u = u * u * (3.0 - 2.0 * u);
          float res = mix(
              mix(revealRand(ip), revealRand(ip + vec2(1.0, 0.0)), u.x),
              mix(revealRand(ip + vec2(0.0, 1.0)), revealRand(ip + vec2(1.0, 1.0)), u.x),
              u.y
          );
          return res * res;
      }
      \n${shader.fragmentShader}
    `;

    // Replace alphatest to inject our discard logic
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <alphatest_fragment>',
      `
      #include <alphatest_fragment>
      
      if (uProgress > 0.001) {
          float rn = revealNoise(vMapUv * 15.0) * 0.15;
          float maskValue = (1.0 - vMapUv.y) + rn;
          float threshold = uProgress * 1.5;
          if (maskValue < threshold) {
              discard;
          }
      }
      `
    );
  }
}
