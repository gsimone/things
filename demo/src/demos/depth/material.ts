import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Color, DepthTexture, Vector3 } from "three";
import { LayerMaterial, Abstract, Depth } from "lamina/vanilla";

export class MyLayer extends Abstract {
  static u_depth_fbo = null;
  static u_factor = 30;

  static u_cameraNear = 0;
  static u_cameraFar = 0;

  static u_resolution = [
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio,
  ];

  // Define your fragment shader just like you already do!
  // Only difference is, you must return the final color of this layer
  static fragmentShader = /* glsl */ `   
    uniform float u_cameraNear;
    uniform float u_cameraFar;
    uniform vec2 u_resolution;

    uniform sampler2D u_depth_fbo;

    #include <packing>

    float readDepth( sampler2D depthSampler, vec2 coord ) {
      float fragCoordZ = texture2D( depthSampler, coord ).x;
      float viewZ = perspectiveDepthToViewZ( fragCoordZ, u_cameraNear, u_cameraFar );
      return viewZToOrthographicDepth(viewZ, u_cameraFar, u_cameraFar);
    }

    vec4 main() {
      vec2  sUv = gl_FragCoord.xy / u_resolution;
      float depth = readDepth( u_depth_fbo, sUv );

      // Local variables must be prefixed by "f_"
      vec4 f_color = vec4(vec3(depth, 0., 0.), 1.);
      return f_color;
    }
  `;

  constructor(props) {
    super(MyLayer, {
      name: "CustomLayer",
      ...props,
    });
  }
}

export const MyMaterial = shaderMaterial(
  {
    u_depth_fbo: new DepthTexture(512, 512),
    u_cameraNear: 0.01,
    u_cameraFar: 30,
    u_resolution: [
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio,
    ],
  },
  /* glsl */ `
varying vec2 vUv;
varying float vViewZ;

uniform float u_cameraNear;
uniform float u_cameraFar;

void main() {
  vec4 worldPosition = modelMatrix *  vec4(position, 1.);
  vec4 viewPosition = viewMatrix * worldPosition;

  vUv = uv;

  gl_Position = projectionMatrix  * viewPosition;
  vViewZ = viewPosition.z;
}
  `,
  /* glsl */ `
  #include <packing>

  varying vec2 vUv;
  varying float vViewZ;

  uniform float u_cameraNear;
  uniform float u_cameraFar;

  uniform sampler2D u_depth_fbo;
  uniform vec2 u_resolution;

  float readDepth( sampler2D depthSampler, vec2 coord ) {
    float fragCoordZ = texture2D( depthSampler, coord ).x;
    float viewZ = perspectiveDepthToViewZ( fragCoordZ, u_cameraNear, u_cameraFar );
    return viewZToOrthographicDepth( viewZ, u_cameraNear, u_cameraFar );
  }

  void main() {
    vec2  sUv = gl_FragCoord.xy / u_resolution;
    float depth = readDepth( u_depth_fbo, sUv );

    gl_FragColor = vec4(vec3( depth ), 1.);
  }
`
);

export const key = (() => Math.random())();
