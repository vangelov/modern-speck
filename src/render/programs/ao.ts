const vertexShaderSrc = `
#version 300 es
precision highp float;

layout(location=0) in vec3 aPosition;

void main() {
    gl_Position = vec4(aPosition, 1);
}
`;

const fragmentShaderSrc = `
#version 300 es
precision highp float;

uniform sampler2D uSceneColor;
uniform sampler2D uSceneDepth;
uniform sampler2D uAccumulatorOut;
uniform vec2 uRes;
uniform float uAO;
uniform float uBrightness;
uniform float uOutlineStrength;

out vec4 fragColor;

void main() {
    vec2 p = gl_FragCoord.xy/uRes;
    vec4 sceneColor = texture(uSceneColor, p);
    if (uOutlineStrength > 0.0) {
        float depth = texture(uSceneDepth, p).r;
        float r = 1.0/511.0;
        float d0 = abs(texture(uSceneDepth, p + vec2(-r,  0)).r - depth);
        float d1 = abs(texture(uSceneDepth, p + vec2( r,  0)).r - depth);
        float d2 = abs(texture(uSceneDepth, p + vec2( 0, -r)).r - depth);
        float d3 = abs(texture(uSceneDepth, p + vec2( 0,  r)).r - depth);
        float d = max(d0, d1);
        d = max(d, d2);
        d = max(d, d3);
        sceneColor.rgb *= pow(1.0 - d, uOutlineStrength * 32.0);
        sceneColor.a = max(step(0.003, d), sceneColor.a);
    }
    vec4 dAccum = texture(uAccumulatorOut, p);
    float shade = max(0.0, 1.0 - (dAccum.r + dAccum.g + dAccum.b + dAccum.a) * 0.25 * uAO);
    shade = pow(shade, 2.0);
    fragColor = vec4(uBrightness * sceneColor.rgb * shade, sceneColor.a);
}
`;

export const AOProgram = {
  vertexShaderSrc,
  fragmentShaderSrc,
};
