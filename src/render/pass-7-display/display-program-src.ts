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

uniform sampler2D uTexture;
uniform vec2 uRes;

out vec4 fragColor;

void main() {
    fragColor = texture(uTexture, gl_FragCoord.xy/uRes);
}
`;

export const DisplayProgramSrc = [vertexShaderSrc, fragmentShaderSrc];
