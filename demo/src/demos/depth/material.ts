import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Color, Vector3 } from "three";



extend({MyDepthMaterial})

export const MyMaterial = shaderMaterial(
  {
    u_depth: null,
    cameraNear: 0.01,
    cameraFar: 30,
    u_mix: 0,
    u_resolution: [0, 0],
    u_water: new Color(),
    u_foam: new Color(),
  },
  /* glsl */ `
varying vec2 vUv;
varying float vViewZ;

uniform float cameraNear;
uniform float cameraFar;

#include <fog_pars_vertex>


void main() {
  vec4 worldPosition = modelMatrix *  vec4(position, 1.);
  vec4 viewPosition = viewMatrix * worldPosition;

  vUv = uv;

  #include <fog_vertex>

  gl_Position = projectionMatrix  * viewPosition;
  vViewZ = viewPosition.z;
}
  `,
  /* glsl */ `
  #include <packing>

  varying vec2 vUv;
  varying float vViewZ;

  uniform float cameraNear;
  uniform float cameraFar;

  uniform sampler2D u_depth;
  uniform float u_mix;
  uniform vec2 u_resolution;

  uniform vec3 u_water;
  uniform vec3 u_foam;

  #include <fog_pars_fragment>

  float readDepth( sampler2D depthSampler, vec2 coord ) {
    float fragCoordZ = texture2D( depthSampler, coord ).x;
    float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
    return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
  }


  float readDepth2( sampler2D depthSampler, vec2 coord ) {
    float fragCoordZ = texture2D( depthSampler, coord ).x;
    float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
    return viewZ;
  }

  void main() {
    vec2  sUv = gl_FragCoord.xy / u_resolution;

    float depth = readDepth2( u_depth, sUv );

    float x = vViewZ - depth;
    x = 1. - x;
    x /= 0.01;

    x = clamp(x, 0., 1.);
   
    vec3 final = mix(u_water, u_foam, x);

    gl_FragColor = vec4(final, 1.);
    
    #include <tonemapping_fragment>
    #include <fog_fragment>

  }
`,
  (m) => {}
);

export const key = (() => Math.random())();

extend({ MyMaterial });
