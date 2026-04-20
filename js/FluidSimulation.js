import * as THREE from "three";

// Import Shaders
import baseVert from "./Shaders/base.vert";
import splatFrag from "./Shaders/splat.frag";
import advectionFrag from "./Shaders/advection.frag";
import divergenceFrag from "./Shaders/divergence.frag";
import curlFrag from "./Shaders/curl.frag";
import vorticityFrag from "./Shaders/vorticity.frag";
import pressureFrag from "./Shaders/pressure.frag";
import gradientSubtractFrag from "./Shaders/gradientSubtract.frag";
import clearFrag from "./Shaders/clear.frag";
import displayFrag from "./Shaders/display.frag";

export class FluidSimulation {
  constructor(canvas, config) {
    this.config = config;
    this._setupRenderer(canvas);
    this._setupScene();
    this._setupTargets();
    this._setupMaterials();
    this._setupInput();
    this._loop();
  }

  _setupRenderer(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.dpr = this.renderer.getPixelRatio();
    this.width = window.innerWidth * this.dpr;
    this.height = window.innerHeight * this.dpr;

    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      const newDpr = this.renderer.getPixelRatio();
      this.width = window.innerWidth * newDpr;
      this.height = window.innerHeight * newDpr;
      this._setupTargets();
    });
  }

  _setupScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    this.scene.add(this.quad);
  }

  _setupTargets() {
    const { simResolution: simRes, dyeResolution: dyeRes } = this.config;
    const aspect = this.width / this.height;
    const options = {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      depthBuffer: false,
    };

    const single = (w, h) => new THREE.WebGLRenderTarget(w, h, options);
    const double = (w, h) => ({
      read: single(w, h),
      write: single(w, h),
      swap() {
        const tmp = this.read;
        this.read = this.write;
        this.write = tmp;
      },
    });

    this.simSize = { w: simRes, h: Math.round(simRes / aspect) };
    this.dyeSize = { w: dyeRes, h: Math.round(dyeRes / aspect) };

    this.velocity = double(this.simSize.w, this.simSize.h);
    this.dye = double(this.dyeSize.w, this.dyeSize.h);
    this.divergence = single(this.simSize.w, this.simSize.h);
    this.curl = single(this.simSize.w, this.simSize.h);
    this.pressure = double(this.simSize.w, this.simSize.h);
  }

  _setupMaterials() {
    const make = (frag, uniforms) =>
      new THREE.ShaderMaterial({
        vertexShader: baseVert,
        fragmentShader: frag,
        uniforms,
      });

    const tex = () => ({ value: null });
    const num = (v = 0) => ({ value: v });
    const vec2 = () => ({ value: new THREE.Vector2() });

    this.material = {
      splat: make(splatFrag, {
        uTarget: tex(),
        aspectRatio: num(),
        radius: num(),
        color: { value: new THREE.Vector3() },
        point: { value: new THREE.Vector2() },
      }),
      advection: make(advectionFrag, {
        uVelocity: tex(),
        uSource: tex(),
        texelSize: vec2(),
        dt: num(),
        dissipation: num(),
      }),
      divergence: make(divergenceFrag, {
        uVelocity: tex(),
        texelSize: vec2(),
      }),
      curl: make(curlFrag, {
        uVelocity: tex(),
        texelSize: vec2(),
      }),
      vorticity: make(vorticityFrag, {
        uVelocity: tex(),
        uCurl: tex(),
        texelSize: vec2(),
        curlStrength: num(),
        dt: num(),
      }),
      pressure: make(pressureFrag, {
        uPressure: tex(),
        uDivergence: tex(),
        texelSize: vec2(),
      }),
      gradientSubtract: make(gradientSubtractFrag, {
        uPressure: tex(),
        uVelocity: tex(),
        texelSize: vec2(),
      }),
      clear: make(clearFrag, {
        uTexture: tex(),
        value: num(),
      }),
      display: make(displayFrag, {
        uTexture: tex(),
        threshold: num(),
        edgeSoftness: num(),
        inkColor: { value: new THREE.Color() },
      }),
    };
  }

  _setupInput() {
    this.mouse = { x: 0, y: 0, velocityX: 0, velocityY: 0, moved: false };
    const onMove = (x, y) => {
      this.mouse.velocityX = (x * this.dpr - this.mouse.x) * this.config.forceStrength;
      this.mouse.velocityY = (y * this.dpr - this.mouse.y) * this.config.forceStrength;
      this.mouse.x = x * this.dpr;
      this.mouse.y = y * this.dpr;
      this.mouse.moved = true;
    };

    window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
    window.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      },
      { passive: false }
    );
  }

  _pass(material, target) {
    this.quad.material = material;
    this.renderer.setRenderTarget(target ?? null);
    this.renderer.render(this.scene, this.camera);
  }

  _set(material, values) {
    Object.entries(values).forEach(([key, val]) => {
      if (material.uniforms[key]) {
        material.uniforms[key].value = val;
      }
    });
    return material;
  }

  _splat(x, y, velocityX, velocityY) {
    const { material: m, velocity: vel, dye, width, height, config: c } = this;

    this._set(m.splat, {
      aspectRatio: width / height,
      point: new THREE.Vector2(x / width, 1 - y / height),
      radius: c.splatRadius / 100,
    });

    this._set(m.splat, {
      uTarget: vel.read.texture,
      color: new THREE.Vector3(velocityX, -velocityY, 0),
    });
    this._pass(m.splat, vel.write);
    vel.swap();

    this._set(m.splat, {
      uTarget: dye.read.texture,
      color: new THREE.Vector3(3, 3, 3),
    });
    this._pass(m.splat, dye.write);
    dye.swap();
  }

  _simulate(dt) {
    const {
      material: m,
      velocity: vel,
      dye,
      divergence: div,
      curl,
      pressure: pres,
      simSize,
      dyeSize,
      config: c,
    } = this;

    const simTexel = new THREE.Vector2(1 / simSize.w, 1 / simSize.h);

    this._pass(this._set(m.curl, { uVelocity: vel.read.texture, texelSize: simTexel }), curl);

    this._pass(
      this._set(m.vorticity, {
        uVelocity: vel.read.texture,
        uCurl: curl.texture,
        texelSize: simTexel,
        curlStrength: c.curl,
        dt,
      }),
      vel.write
    );
    vel.swap();

    this._pass(
      this._set(m.divergence, {
        uVelocity: vel.read.texture,
        texelSize: simTexel,
      }),
      div
    );

    this._pass(
      this._set(m.clear, {
        uTexture: pres.read.texture,
        value: c.pressureDecay,
      }),
      pres.write
    );
    pres.swap();

    this._set(m.pressure, { uDivergence: div.texture, texelSize: simTexel });
    for (let i = 0; i < c.pressureIterations; i++) {
      m.pressure.uniforms.uPressure.value = pres.read.texture;
      this._pass(m.pressure, pres.write);
      pres.swap();
    }

    this._pass(
      this._set(m.gradientSubtract, {
        uPressure: pres.read.texture,
        uVelocity: vel.read.texture,
        texelSize: simTexel,
      }),
      vel.write
    );
    vel.swap();

    this._set(m.advection, {
      uVelocity: vel.read.texture,
      uSource: vel.read.texture,
      texelSize: simTexel,
      dt,
      dissipation: c.velocityDissipation,
    });
    this._pass(m.advection, vel.write);
    vel.swap();

    this._set(m.advection, {
      uSource: dye.read.texture,
      texelSize: new THREE.Vector2(1 / dyeSize.w, 1 / dyeSize.h),
      dissipation: c.dyeDissipation,
    });
    this._pass(m.advection, dye.write);
    dye.swap();
  }

  _render() {
    this._pass(
      this._set(this.material.display, {
        uTexture: this.dye.read.texture,
        threshold: this.config.threshold,
        edgeSoftness: this.config.edgeSoftness,
        inkColor: this.config.inkColor,
      }),
      null
    );
  }

  _loop() {
    let lastTime = Date.now();
    const tick = () => {
      const dt = Math.min((Date.now() - lastTime) / 1000, 0.016);
      lastTime = Date.now();

      if (this.mouse.moved) {
        this._splat(this.mouse.x, this.mouse.y, this.mouse.velocityX, this.mouse.velocityY);
        this.mouse.moved = false;
      }

      this._simulate(dt);
      this._render();
      requestAnimationFrame(tick);
    };
    tick();
  }
}