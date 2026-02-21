export const vertexShaderSrc = `
#version 300 es
precision highp float;

layout(location=0) in vec3 aImposter;
layout(location=1) in vec3 aPosA;
layout(location=2) in vec3 aPosB;
layout(location=3) in float aRadA;
layout(location=4) in float aRadB;
layout(location=5) in vec3 aColA;
layout(location=6) in vec3 aColB;

uniform mat4 uView;
uniform mat4 uProjection;
uniform mat4 uModel;
uniform mat4 uRotation;
uniform float uBondRadius;
uniform float uAtomScale;
uniform float uRelativeAtomScale;

out vec3 vNormal;
out vec3 vPosA, vPosB;
out float vRadA, vRadB;
out vec3 vColA, vColB;
out float vRadius;

mat3 alignVector(vec3 a, vec3 b) {
    vec3 v = cross(a, b);
    float s = length(v);
    float c = dot(a, b);
    mat3 I = mat3(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    );
    mat3 vx = mat3(
        0, v.z, -v.y,
        -v.z, 0, v.x,
        v.y, -v.x, 0
    );
    return I + vx + vx * vx * ((1.0 - c) / (s * s));
}

void main() {
    vRadius = uBondRadius;
    vec3 pos = vec3(aImposter);
    // Scale the box in x and z to be bond-radius.
    pos = pos * vec3(vRadius, 1, vRadius);
    // Shift the origin-centered cube so that the bottom is at the origin.
    pos = pos + vec3(0, 1, 0);
    // Stretch the box in y so that it is the length of the bond.
    pos = pos * vec3(1, length(aPosA - aPosB) * 0.5, 1);
    // Find the rotation that aligns vec3(0, 1, 0) with vec3(uPosB - uPosA) and apply it.
    vec3 a = normalize(vec3(-0.000001, 1.000001, 0.000001));
    vec3 b = normalize(aPosB - aPosA);
    mat3 R = alignVector(a, b);
    pos = R * pos;
    // Shift the cube so that the bottom is centered at the middle of atom A.
    pos = pos + aPosA;

    vec4 position = uModel * vec4(pos, 1);
    gl_Position = uProjection * uView * position;
    vPosA = aPosA;
    vPosB = aPosB;
    vRadA = uAtomScale * (1.0 + (aRadA - 1.0) * uRelativeAtomScale);
    vRadB = uAtomScale * (1.0 + (aRadB - 1.0) * uRelativeAtomScale);
    vColA = aColA;
    vColB = aColB;
}
`;

const fragmentShaderSrc = `
#version 300 es
precision highp float;

uniform mat4 uRotation;
uniform vec2 uBottomLeft;
uniform vec2 uTopRight;
uniform float uDepth;
uniform vec2 uRes;
uniform float uBondShade;

in vec3 vPosA, vPosB;
in float vRadA, vRadB;
in vec3 vColA, vColB;
in float vRadius;

layout(location=0) out vec4 fragColor;
layout(location=1) out vec4 fragNormal;

mat3 alignVector(vec3 a, vec3 b) {
    vec3 v = cross(a, b);
    float s = length(v);
    float c = dot(a, b);
    mat3 I = mat3(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    );
    mat3 vx = mat3(
        0, v.z, -v.y,
        -v.z, 0, v.x,
        v.y, -v.x, 0
    );
    return I + vx + vx * vx * ((1.0 - c) / (s * s));
}

void main() {
    vec3 r0 = vec3(uBottomLeft + (gl_FragCoord.xy/uRes) * (uTopRight - uBottomLeft), uDepth/2.0);
    vec3 rd = vec3(0, 0, -1);

    vec3 i = normalize(vPosB - vPosA);
         i = vec3(uRotation * vec4(i, 0));
    vec3 j = normalize(vec3(-0.000001, 1.000001, 0.000001));
    mat3 R = alignVector(i, j);

    vec3 r0p = r0 - vec3(uRotation * vec4(vPosA, 0));
    r0p = R * r0p;
    vec3 rdp = R * rd;

    float a = dot(rdp.xz, rdp.xz);
    float b = 2.0 * dot(rdp.xz, r0p.xz);
    float c = dot(r0p.xz, r0p.xz) - vRadius*vRadius;
    float disc = b*b - 4.0*a*c;
    if (disc <= 0.0) {
        discard;
    }
    float t = (-b - sqrt(disc))/(2.0*a);
    if (t < 0.0) {
        discard;
    }

    vec3 coord = r0p + rdp * t;
    if (coord.y < 0.0 || coord.y > length(vPosA - vPosB)) {
        discard;
    }

    vec3 color;
    if (coord.y < vRadA + 0.5 * (length(vPosA - vPosB) - (vRadA + vRadB))) {
        color = vColA;
    } else {
        color = vColB;
    }

    color = mix(color, vec3(1,1,1), uBondShade);

    R = alignVector(j, i);
    vec3 normal = normalize(R * vec3(coord.x, 0, coord.z));

    coord = r0 + rd * t;

    fragColor = vec4(color, 1);
    fragNormal = vec4(normal * 0.5 + 0.5, 1.0);

    gl_FragDepth = -(coord.z - uDepth/2.0)/uDepth;
}
`;

export const BondsProgramSrc = [vertexShaderSrc, fragmentShaderSrc];
