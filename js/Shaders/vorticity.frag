precision highp float;
precision mediump sampler2D;

uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2 texelSize;
uniform float curlStrength;
uniform float dt;
varying vec2 vUv;

void main() {
    float L = texture2D(uCurl, vUv - vec2(texelSize.x, 0.0)).x;
    float R = texture2D(uCurl, vUv + vec2(texelSize.x, 0.0)).x;
    float T = texture2D(uCurl, vUv + vec2(0.0, texelSize.y)).x;
    float B = texture2D(uCurl, vUv - vec2(0.0, texelSize.y)).x;
    float C = texture2D(uCurl, vUv).x;

    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(L) - abs(R)); // Fixed the cross product direction to match shaders.js logic
    force /= length(force) + 0.0001;
    force *= curlStrength * C;

    vec2 vel = texture2D(uVelocity, vUv).xy;
    gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
}
