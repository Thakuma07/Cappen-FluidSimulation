precision highp float;

uniform sampler2D uTexture;
uniform float threshold;
uniform float edgeSoftness;
uniform vec3 inkColor;
varying vec2 vUv;

void main() {
    float d = clamp(length(texture2D(uTexture, vUv).rgb), 0.0, 1.0);
    float a = edgeSoftness > 0.0 ? 
        smoothstep(threshold - edgeSoftness * 0.5, threshold + edgeSoftness * 0.5, d) : 
        step(threshold, d);
    gl_FragColor = vec4(inkColor, a);
}
