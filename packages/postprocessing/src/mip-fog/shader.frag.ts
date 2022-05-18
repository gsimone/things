import { lib } from "./lib.frag";

export const frag = /* glsl */ `

uniform mat4 inverseProjectionMatrix;
uniform mat4 projectionMatrix;

uniform mat4 viewMatrix;
uniform mat4 inverseViewMatrix;

uniform float fogHeight;
uniform float fogOffset;
uniform float fogAlpha;
uniform vec3 lightDirection;

uniform sampler2D fogEnv;

uniform float cameraNear;
uniform float cameraFar;

${lib}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
	float d = (1. - depth);

	vec3 viewPos = getViewPosition(uv, depth);

	vec3 direction = normalize(transformDirection(viewPos, inverseViewMatrix));
	vec2 euv = equirectUv(direction);

	float _d_ = (1. - viewPos.z)/300.;
	float debug = saturate( (depth - cameraNear ) / (cameraFar - cameraNear) );
	
	float miplevel = (1. - _d_) * 11.;
	vec3 fogColor = texture(fogEnv, euv, miplevel).rgb;

	float fogDensity = 1.;
	float fogFactor = 1.0 - exp( - fogDensity * fogDensity * _d_ * _d_ );
	
	outputColor.rgb = mix(fogColor, inputColor.rgb, vec3(1. -fogFactor));
	//outputColor.rgb = vec3(fogFactor);
	outputColor.a = inputColor.a;
}
`;
