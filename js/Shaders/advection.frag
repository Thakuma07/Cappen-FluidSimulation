precision highp float;
precision mediump sampler2D;

uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
varying vec2 vUv;

void main() {
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    gl_FragColor = vec4(dissipation * texture2D(uSource, coord).rgb, 1.0);
}
