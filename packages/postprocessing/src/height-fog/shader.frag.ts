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

${lib}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
	float d = (1. - depth);
	
	vec3 pos = (inverseViewMatrix * vec4(getViewPosition(uv, depth), 1.)).xyz ;
	float noise = snoise(
		(pos * 2.) + vec3(time * .01, 0., 0.)
	) * .5 + .5;

	float y = pos.y;

	y+= -fogOffset;
	y /= fogHeight;

	y = clamp(y, 0., 1.);
	
	// exponential
	float fogDensity = 1. / .5;
	y = 1.0 - exp( - fogDensity * fogDensity * y * y );

	// linear
	// y = smoothstep(.0, 1., y);

	float alpha = fogAlpha * (1. - y);

	float lightDot = dot(lightDirection, pos);

	lightDot = smoothstep(-100., 100., lightDot);
	
	vec3 finalColor = mix(fogColor, fogColor2, lightDot);

	outputColor = vec4(finalColor, alpha);
	// outputColor = vec4(vec3(lightDot), alpha);
}
`;
