precision highp float;
precision mediump sampler2D;

uniform sampler2D uTarget;
uniform float aspectRatio;
uniform float radius;
uniform vec3 color;
uniform vec2 point;
varying vec2 vUv;

void main() {
    vec2 p = vUv - point;
    p.x *= aspectRatio;
    vec3 base = texture2D(uTarget, vUv).xyz;
    float splat = exp(-dot(p, p) / radius);
    gl_FragColor = vec4(base + splat * color, 1.0);
}
