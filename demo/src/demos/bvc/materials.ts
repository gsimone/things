import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

export const materialKey = (() => Math.random())();

const MyMaterial = shaderMaterial(
  {
    u_data: null,
    u_map: null,
    u_index: 0,
    u_horizontalSlices: 4,
    u_verticalSlices: 4,
    u_vertices: 8,
    u_debugUv: 0
  },
  /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D u_data;
  uniform float u_index;

  uniform float u_horizontalSlices;
  uniform float u_verticalSlices;
  uniform float u_vertices;
  
  vec2 flipbookUv( vec2 uv, float horizontalSlices, float verticalSlices, float index ) {
    float horizontalIndex = mod(index, horizontalSlices);
    float verticalIndex = floor(index / horizontalSlices);
    
    float u = uv.x + 0.5;
    u = u / horizontalSlices +  (1. / horizontalSlices) * horizontalIndex;

    float v = uv.y + 0.5;
    v = ( v / verticalSlices) + 1. - (1. / verticalSlices) * (verticalIndex + 1.);

    return vec2(u, v);
  }

  vec3 getPositionFromDataTexture( sampler2D data, int vertexID, float numberOfVertices, float horizontalSlices, float verticalSlices, float index) {
    float u = float( vertexID ) / numberOfVertices;
    float total = horizontalSlices * verticalSlices;
    float v  = ( 1. / total ) * index;
    vec3 pos = texture2D( data, vec2( u, v ) ).rgb;

    return pos;
  }

  vec3 billboard(vec2 v, mat4 view){
    vec3 up = vec3(view[0][1], view[1][1], view[2][1]);
    vec3 right = vec3(view[0][0], view[1][0], view[2][0]);
    vec3 p = right * v.x + up * v.y;
    return p;
  }
  
  void main () {
    float offsetIndex = u_index - mod(float(gl_InstanceID), u_horizontalSlices * u_verticalSlices);

    vec3 pos = getPositionFromDataTexture( u_data, gl_VertexID, u_vertices, u_horizontalSlices, u_verticalSlices, offsetIndex );
    vUv = flipbookUv( pos.xy, u_horizontalSlices, u_verticalSlices, offsetIndex );

    pos = (instanceMatrix * vec4(pos, 1.0)).xyz;

    pos = billboard( pos.xy, viewMatrix );

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`,
  /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D u_map;
  uniform float u_index;
  uniform float u_debugUv;

  void main() {
    vec4 color = texture2D(u_map, vUv).rgba;
    
    gl_FragColor = vec4(mix(color, vec4(vUv, 0., 1.), u_debugUv));
  }
`
);

const MyUVsMaterial = shaderMaterial(
  {},
  /* glsl */ `
  varying vec2 vUv; 

  void main () {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,
  /* glsl */ `
  varying vec2 vUv;

  void main () {
    gl_FragColor = vec4(vUv, 0.0, 1.0);
  }
`
);

const MyBillboardMaterial = shaderMaterial(
  {
    map: null,
  },
  /* glsl */ `
  varying vec2 vUv; 

  vec3 billboard(vec2 v, mat4 view){
    vec3 up = vec3(view[0][1], view[1][1], view[2][1]);
    vec3 right = vec3(view[0][0], view[1][0], view[2][0]);
    vec3 p = right * v.x + up * v.y;
    return p;
  }

  void main () {
    vUv = uv;

    vec3 transformed = position;

    transformed = billboard(transformed.xy, viewMatrix);

    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(transformed, 1.0);
  }
`,
  /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D map;

  void main () {
    vec4 col = texture2D(map, vUv);
    gl_FragColor = vec4(col);
  }
`
);


extend({ MyMaterial, MyBillboardMaterial, MyUVsMaterial });
