import { lib } from "./lib.frag";

/**

#define USE_HALO true
precision highp float;
#define GLSLIFY 1
uniform sampler2D u_texture;
uniform float u_luminosityThreshold;
uniform float u_smoothWidth;
#ifdef USE_HALO
    uniform vec2 u_texelSize;
    uniform vec2 u_aspect;
    uniform float u_haloWidth;
    uniform float u_haloRGBShift;
    uniform float u_haloStrength;
#endif
varying vec2 v_uv;
void main() {
    vec4 texel = texture2D(u_texture, v_uv);
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float v = dot(texel.xyz, luma);
    vec4 outputColor = vec4(0.0, 0.0, 0.0, 1.0);
    float alpha = smoothstep(u_luminosityThreshold, u_luminosityThreshold+u_smoothWidth, v);
    outputColor = mix(outputColor, texel, alpha);
    gl_FragColor = vec4(outputColor.rgb, 1.0);
    #ifdef USE_HALO
        vec2 toCenter = (v_uv-0.5)*u_aspect;
        vec2 ghostUv = 1.0-(toCenter+0.5);
        vec2 ghostVec = (vec2(0.5)-ghostUv);
        vec2 direction = normalize(ghostVec);
        vec2 haloVec = direction*u_haloWidth;
        vec3 distortion = vec3(-u_texelSize.x, 0.0, u_texelSize.x)*u_haloRGBShift;
        vec2 uv = ghostUv+haloVec;
        gl_FragColor.rgb += vec3(texture2D(u_texture, uv+direction*distortion.r).r, texture2D(u_texture, uv+direction*distortion.g).g, texture2D(u_texture, uv+direction*distortion.b).b)*u_haloStrength*smoothstep(0.2, 0.5, length(v_uv-0.5));
    #endif
}

 */

export const frag = /* glsl */ `

float u_luminosityThreshold = .9;
float u_smoothWidth = .1;

#define USE_HALO true

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	vec3 luma = vec3(0.299, 0.587, 0.114);

	float v = dot(inputColor.xyz, luma);
	float alpha = smoothstep(u_luminosityThreshold, u_luminosityThreshold+u_smoothWidth, v);
	
	outputColor = vec4(0.0, 0.0, 0.0, 1.0);
	outputColor = mix(outputColor, inputColor, alpha);

    float u_haloStrength = 1.;
    float u_haloWidth = .32;
    float u_haloRGBShift =  40.;

    vec2 toCenter = ( uv - 0.5 ) * vec2( 1. );
    vec2 ghostUv = 1.0 - ( toCenter + 0.5 );
    vec2 ghostVec = vec2( 0.5 ) - ghostUv;
    vec2 direction = normalize( ghostVec );
    vec2 haloVec = direction * u_haloWidth;
    vec3 distortion = vec3( -texelSize.x, 0.0, texelSize.x ) * u_haloRGBShift;
    vec2 _uv = ghostUv + haloVec;

    outputColor.rgb += vec3(
        texture2D( inputBuffer, _uv + direction * distortion.r ).r, 
        texture2D( inputBuffer, _uv + direction * distortion.g ).g, 
        texture2D( inputBuffer, _uv + direction * distortion.b ).b
    ) * u_haloStrength * smoothstep( 0.2, 0.5, length( uv - 0.5 ) );

    // outputColor.rgb = vec3(_uv, .0);

}
`;
