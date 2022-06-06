import { lib } from "./lib.frag";

export const frag = /* glsl */ `

uniform mat4 inverseProjectionMatrix;
uniform mat4 projectionMatrix;

uniform mat4 inverseViewMatrix;

uniform float fogHeight;
uniform float fogOffset;
uniform float fogAlpha;
uniform vec3 fogColor;
uniform vec3 fogColor2;
uniform vec3 lightDirection;

uniform sampler2D fogRamp;

${lib}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
	vec3 viewPos = getViewPosition(uv, depth);

	float d = (1. - viewPos.z) / 300.;

	float fogFactor = 1.0 - exp( - 1. * d * d );
	float alpha = 1. * (1. - d);

	d = smoothstep(0., 1., d);

	vec4 fogColor =vec4(1.);

	outputColor.rgb = inputColor.rgb;

	outputColor.rgb = mix(inputColor.rgb, fogColor.rgb, vec3(1. - fogFactor));

	outputColor.a = fogFactor;
	
	// outputColor = vec4(vec3(lightDot), alpha);
}
`;
