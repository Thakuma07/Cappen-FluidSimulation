precision highp float;
precision mediump sampler2D;

uniform sampler2D uVelocity;
uniform vec2 texelSize;
varying vec2 vUv;

vec2 vel(vec2 uv) {
    vec2 e = vec2(1.0);
    if (uv.x < 0.0) { uv.x = 0.0; e.x = -1.0; }
    if (uv.x > 1.0) { uv.x = 1.0; e.x = -1.0; }
    if (uv.y < 0.0) { uv.y = 0.0; e.y = -1.0; }
    if (uv.y > 1.0) { uv.y = 1.0; e.y = -1.0; }
    return e * texture2D(uVelocity, uv).xy;
}

void main() {
    float L = vel(vUv - vec2(texelSize.x, 0.0)).x;
    float R = vel(vUv + vec2(texelSize.x, 0.0)).x;
    float T = vel(vUv + vec2(0.0, texelSize.y)).y;
    float B = vel(vUv - vec2(0.0, texelSize.y)).y;
    gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}
