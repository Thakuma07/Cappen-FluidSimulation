precision highp float;
precision mediump sampler2D;

uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 texelSize;
varying vec2 vUv;

void main() {
    float L = texture2D(uPressure, clamp(vUv - vec2(texelSize.x, 0.0), 0.0, 1.0)).x;
    float R = texture2D(uPressure, clamp(vUv + vec2(texelSize.x, 0.0), 0.0, 1.0)).x;
    float T = texture2D(uPressure, clamp(vUv + vec2(0.0, texelSize.y), 0.0, 1.0)).x;
    float B = texture2D(uPressure, clamp(vUv - vec2(0.0, texelSize.y), 0.0, 1.0)).x;
    float div = texture2D(uDivergence, vUv).x;
    gl_FragColor = vec4((L + R + T + B - div) * 0.25, 0.0, 0.0, 1.0);
}
