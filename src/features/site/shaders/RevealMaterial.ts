import { MeshStandardMaterial, Vector3 } from 'three';

/**
 * RevealMaterial injects a 3D wet paint sweep shader
 * into the standard MeshStandardMaterial.
 */
export class RevealMaterial extends MeshStandardMaterial {
  public uPaintProgress: { value: number };
  public uRoomOrigin: { value: Vector3 };

  constructor(parameters = {}) {
    super(parameters);
    this.uPaintProgress = { value: 0.0 };
    this.uRoomOrigin = { value: new Vector3(0, 0, 0) };
    this.transparent = true;
  }

  onBeforeCompile(shader: any) {
    shader.uniforms.uPaintProgress = this.uPaintProgress;
    shader.uniforms.uRoomOrigin = this.uRoomOrigin;

    // Inject varying in vertex shader to pass world position
    shader.vertexShader = `
      varying vec3 vWorldPositionColor;
      \n${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `
      #include <worldpos_vertex>
      vWorldPositionColor = (modelMatrix * vec4(transformed, 1.0)).xyz;
      `
    );

    // Inject uniforms and noise functions in fragment shader
    shader.fragmentShader = `
      uniform float uPaintProgress;
      uniform vec3 uRoomOrigin;
      varying vec3 vWorldPositionColor;

      float paintHash(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float paintNoise(vec2 x) {
          vec2 i = floor(x); 
          vec2 f = fract(x);
          float a = paintHash(i);
          float b = paintHash(i + vec2(1.0, 0.0));
          float c = paintHash(i + vec2(0.0, 1.0));
          float d = paintHash(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      \n${shader.fragmentShader}
    `;

    // Replace dithering or standard closing to inject our sweep logic
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      #include <dithering_fragment>
      
      vec3 localPos = vWorldPositionColor - uRoomOrigin;
      vec3 revealDir = normalize(vec3(-1.0, 0.0, 0.1));
      
      float startDist = -5.0; 
      float endDist = 55.0;
      float targetDist = mix(startDist, endDist, uPaintProgress);
      
      float distFromPlane = targetDist - dot(localPos, revealDir);
      
      float n = paintNoise(localPos.yz * 2.0) * 2.0;
      float n2 = paintNoise(localPos.yz * 8.0) * 0.5;
      float combinedNoise = n + n2;
      
      float boundary = distFromPlane + combinedNoise;
      
      if (boundary < 0.0) {
          discard;
      }
      
      if (uPaintProgress < 0.999 && boundary < 2.0) {
          float glow = smoothstep(2.0, 0.0, boundary);
          gl_FragColor.rgb += vec3(glow * 0.4, glow * 0.5, glow * 0.7);
      }
      `
    );
  }
}
