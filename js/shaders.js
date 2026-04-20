const v = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.); }`;
const p = `precision highp float;`;
const s = `precision mediump sampler2D;`;

export default {
    splat: [
        v,
        `${p} ${s}
        uniform sampler2D uTarget; uniform float aspectRation,radius; uniform vec3 color; uniform vec2 point; varying vec2 vUV;
        void main(){ vec2 p=vUv-point; p.x*=aspectRatio; gl_FragColor=vec4 (texture2D(uTarget,vUv).xyz+exp(-dot(p,p)/radius)*color,1.); }`,
    ],

    advection: [
        v,
        `${p} ${s}
        uniform sampler2D uVelocity,uSource; uniform vec2 texelSize; uniform float dt,dissipation; varying vec2 vUv;
        void main() { gl_FragColor=vec4(dissipation*texture2D(uSource,vUv-dt*texture2D(uVelocity,vUv).xy*texelSize).rgb,1); }`,
    ],

    divergence: [
  v,
  `${p} ${s}
  uniform sampler2D uVelocity; uniform vec2 texelSize; varying vec2 vUv;
  vec2 vel(vec2 uv){ vec2 e=vec2(1.); if(uv.x<0.){uv.x=0.;e.x=-1.;} if(uv.x>1.){uv.x=1.;e.x=-1.;} if(uv.y<0.){uv.y=0.;e.y=-1.;} if(uv.y>1.){uv.y=1.;e.y=-1.;} return e*texture2D(uVelocity,uv).xy; }
  void main(){ vec2 L=vUv-vec2(texelSize.x,0.),R=vUv+vec2(texelSize.x,0.),
  T=vUv+vec2(0.,texelSize.y),B=vUv-vec2(0.,texelSize.y); gl_FragColor=vec4
  (.5*(vel(R).x-vel(L).x+vel(T).y-vel(B).y),0.,0.,1.); }`,
],

    curl: [
  v,
  `${p} ${s}
  uniform sampler2D uVelocity; uniform vec2 texelSize; varying vec2 vUv;
  void main(){ vec2 L=vUv-vec2(texelSize.x,0.),R=vUv+vec2(texelSize.x,0.),
  T=vUv+vec2(0.,texelSize.y),B=vUv-vec2(0.,texelSize.y); gl_FragColor=vec4
  (texture2D(uVelocity,R).y-texture2D(uVelocity,L).y-texture2D(uVelocity,
  T).x+texture2D(uVelocity,B).x,0.,0.,1.); }`,
],

    vorticity: [
    v,
    `${p} ${s}
    uniform sampler2D uVelocity,uCurl; uniform vec2 texelSize; uniform float curlStrength,dt; varying vec2 vUv;
    void main(){ vec2 L=vUv-vec2(texelSize.x,0.),R=vUv+vec2(texelSize.x,0.),T=vUv+vec2(0.,texelSize.y),B=vUv-vec2(0.,texelSize.y); vec2 f=normalize(vec2(abs(texture2D(uCurl,T).x)-abs(texture2D(uCurl,B).x),abs(texture2D(uCurl,R).x)-abs(texture2D(uCurl,L).x))+.0001)*curlStrength*texture2D(uCurl,vUv).x; gl_FragColor=vec4(texture2D(uVelocity,vUv).xy+f*dt,0.,1.); }`,
],

    pressure: [
    v,
    `${p} ${s}
    uniform sampler2D uPressure,uDivergence; uniform vec2 texelSize; varying vec2 vUv;
    void main(){ vec2 L=clamp(vUv-vec2(texelSize.x,0.),0.,1.),R=clamp(vUv+vec2(texelSize.x,0.),0.,1.),T=clamp(vUv+vec2(0.,texelSize.y),0.,1.),B=clamp(vUv-vec2(0.,texelSize.y),0.,1.); gl_FragColor=vec4((texture2D(uPressure,L).x+texture2D(uPressure,R).x+texture2D(uPressure,T).x+texture2D(uPressure,B).x-texture2D(uDivergence,vUv).x)*.25,0.,0.,1.); }
    `,
],

    gradientSubtract: [
    v,
    `${p} ${s}
    uniform sampler2D uPressure,uVelocity; uniform vec2 texelSize; varying vec2 vUv;
    void main(){ float pL=texture2D(uPressure,clamp(vUv-vec2(texelSize.x,0.),0.,1.)).x,pR=texture2D(uPressure,clamp(vUv+vec2(texelSize.x,0.),0.,1.)).x,pT=texture2D(uPressure,clamp(vUv+vec2(0.,texelSize.y),0.,1.)).x,pB=texture2D(uPressure,clamp(vUv-vec2(0.,texelSize.y),0.,1.)).x; gl_FragColor=vec4(texture2D(uVelocity,vUv).xy-vec2(pR-pL,pT-pB),0.,1.); }
    `,
],

    clear: [
    v,
    `${p} ${s}
    uniform sampler2D uTexture; uniform float value; varying vec2 vUv;
    void main(){ gl_FragColor=value*texture2D(uTexture,vUv); }`,
],

display: [
    v,
    `${p}
    uniform sampler2D uTexture; uniform float threshold,edgeSoftness;
    uniform vec3 inkColor; varying vec2 vUv;
    void main(){ float d=clamp(length(texture2D(uTexture,vUv).rgb),0.,1.);
    float a=edgeSoftness>0.?smoothstep(threshold-edgeSoftness*.5,threshold
    +edgeSoftness*.5,d):step(threshold,d); gl_FragColor=vec4(inkColor,a); }`,
],
}