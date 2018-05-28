import { PostprocessBase, PostprocessPass } from 'oxygen-core';

let uidGenerator = 0;

export function calculateMipmapScale(level) {
  level = level | 0;
  return 1 / Math.max(1, Math.pow(2, Math.max(0, level)));
}

export class BlurPostprocessPass extends PostprocessPass {

  get scale() {
    return this._scale;
  }

  set scale(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    this._scale = value;
  }

  get levels() {
    return this._levels;
  }

  set levels(value) {
    if (!value) {
      this._levels = [1, 2, 3, 4];
      return;
    }
    if (typeof value === 'number') {
      value = [value, value + 1, value + 2, value + 3];
    }
    if (!Array.isArray(value)) {
      throw new Error('`value` is not type of Array!');
    }

    this._levels = value;
  }

  get renderTargets() {
    return this._renderTargets;
  }

  constructor() {
    super();

    this._scale = 1;
    this._levels = [1, 2, 3, 4];
    this._renderer = null;
    this._renderTargets = null;
    this._dirty = true;
  }

  dispose() {
    super.dispose();

    const { _renderer, _renderTargets } = this;
    if (!!_renderer) {
      for (const item of _renderTargets) {
        _renderer.unregisterRenderTarget(item);
      }
    }

    this._levels = null;
    this._renderer = null;
    this._renderTargets = null;
  }

  onApply(gl, renderer, textureSource, renderTarget) {
    this._renderer = renderer;
    if (!!this._dirty) {
      this._dirty = false;

      const { width, height } = renderer.canvas;
      const { _levels, _renderTargets } = this;
      if (!!_renderTargets) {
        for (const item of _renderTargets) {
          renderer.unregisterRenderTarget(item);
        }
      }

      this._renderTargets = [
        `#BlurPostprocessPass-${++uidGenerator}`,
        `#BlurPostprocessPass-${++uidGenerator}`,
        `#BlurPostprocessPass-${++uidGenerator}`,
        `#BlurPostprocessPass-${++uidGenerator}`
      ];

      let i = 0;
      for (const item of this._renderTargets) {
        const scale = calculateMipmapScale(_levels[i++] || 0);
        renderer.registerRenderTarget(
          item,
          (width * scale) | 0,
          (height * scale) | 0
        );
      }
    }

    this.overrideUniforms = this.overrideUniforms || {};
    this.overrideUniforms.uScale = this.overrideUniforms.uScale || [0, 0];
    const {
      shader,
      overrideUniforms,
      overrideSamplers,
      _renderTargets,
      _scale
    } = this;
    const { uScale } = overrideUniforms;

    uScale[0] = _scale;
    uScale[1] = 0;
    this.apply(
      gl, renderer,
      textureSource, _renderTargets[0],
      shader, overrideUniforms, overrideSamplers
    );

    uScale[0] = 0;
    uScale[1] = _scale;
    this.apply(
      gl, renderer,
      _renderTargets[0], _renderTargets[1],
      shader, overrideUniforms, overrideSamplers
    );

    uScale[0] = _scale;
    uScale[1] = 0;
    this.apply(
      gl, renderer,
      _renderTargets[1], _renderTargets[2],
      shader, overrideUniforms, overrideSamplers
    );

    uScale[0] = 0;
    uScale[1] = _scale;
    this.apply(
      gl, renderer,
      _renderTargets[2], _renderTargets[3],
      shader, overrideUniforms, overrideSamplers
    );
  }

  onResize(width, height) {
    this._dirty = true;
  }

}

export class EffectPostprocessPass extends PostprocessPass {

  get intensity() {
    return this._intensity;
  }

  set intensity(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    this._intensity = value;
  }

  get treshold() {
    return this._treshold;
  }

  set treshold(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    this._treshold = value;
  }

  get weights() {
    return this._weights;
  }

  set weights(value) {
    if (!value) {
      this._weights = [0.125, 0.375, 0.375, 0.125];
      return;
    }
    if (value === 'gaussian') {
      value = [0.125, 0.375, 0.375, 0.125];
    } else if (value === 'flat') {
      value = [0.25, 0.25, 0.25, 0.25];
    } else if (value === 'increasing') {
      value = [0.1, 0.2, 0.3, 0.4];
    } else if (value === 'decreasing') {
      value = [0.4, 0.3, 0.2, 0.1];
    }
    if (!Array.isArray(value)) {
      throw new Error('`value` is not type of Array!');
    }

    this._weights = value;
  }

  constructor() {
    super();

    this._intensity = 1;
    this._treshold = 0;
    this._weights = [0.125, 0.375, 0.375, 0.125];
  }

  dispose() {
    super.dispose();

    this._weights = null;
  }

  onApply(gl, renderer, textureSource, renderTarget, blurTextures) {
    this.overrideSamplers = this.overrideSamplers || {};
    this.overrideSamplers.sMipmap0 = this.overrideSamplers.sMipmap0 || {};
    this.overrideSamplers.sMipmap1 = this.overrideSamplers.sMipmap1 || {};
    this.overrideSamplers.sMipmap2 = this.overrideSamplers.sMipmap2 || {};
    this.overrideSamplers.sMipmap3 = this.overrideSamplers.sMipmap3 || {};
    this.overrideUniforms = this.overrideUniforms || {};
    this.overrideUniforms.uIntensity = this._intensity;
    this.overrideUniforms.uTreshold = this._treshold;
    this.overrideUniforms.uWeights = this._weights;
    const { shader, overrideUniforms, overrideSamplers } = this;
    const { sMipmap0, sMipmap1, sMipmap2, sMipmap3 } = overrideSamplers;

    sMipmap0.texture = blurTextures[0];
    sMipmap1.texture = blurTextures[1];
    sMipmap2.texture = blurTextures[2];
    sMipmap3.texture = blurTextures[3];
    this.apply(
      gl, renderer,
      textureSource, renderTarget,
      shader, overrideUniforms, overrideSamplers
    );
  }

}

export class BloomPostprocessPass extends PostprocessPass {

  get blurPass() {
    return this._blurPass;
  }

  get effectPass() {
    return this._effectPass;
  }

  constructor() {
    super();

    this._blurPass = new BlurPostprocessPass();
    this._effectPass = new EffectPostprocessPass();
  }

  dispose() {
    super.dispose();

    this._blurPass.dispose();
    this._effectPass.dispose();
    this._blurPass = null;
    this._effectPass = null;
  }

  onApply(gl, renderer, textureSource, renderTarget) {
    this._blurPass.onApply(gl, renderer, textureSource, null);

    this._effectPass.onApply(
      gl,
      renderer,
      textureSource,
      renderTarget,
      this._blurPass.renderTargets
    );
  }

  onResize(width, height) {
    this._blurPass.onResize(width, height);
    this._effectPass.onResize(width, height);
  }

}

export default class BloomPostprocess extends PostprocessBase {

  static get propsTypes() {
    return {
      shaderEffect: 'string_null',
      shaderBlur: 'string_null',
      levels: 'array(integer)',
      weights: 'array(number)',
      intensity: 'number',
      treshold: 'number',
      scale: 'number'
    };
  }

  static factory() {
    return new BloomPostprocess();
  }

  get shaderEffect() {
    return this._pass.effectPass.shader;
  }

  set shaderEffect(value) {
    this._pass.effectPass.shader = value;
  }

  get shaderBlur() {
    return this._pass.blurPass.shader;
  }

  set shaderBlur(value) {
    this._pass.blurPass.shader = value;
  }

  get levels() {
    return this._pass.blurPass.levels;
  }

  set levels(value) {
    this._pass.blurPass.levels = value;
  }

  get weights() {
    return this._pass.effectPass.weights;
  }

  set weights(value) {
    this._pass.effectPass.weights = value;
  }

  get intensity() {
    return this._pass.effectPass.intensity;
  }

  set intensity(value) {
    this._pass.effectPass.intensity = value;
  }

  get treshold() {
    return this._pass.effectPass.treshold;
  }

  set treshold(value) {
    this._pass.effectPass.treshold = value;
  }

  get scale() {
    return this._pass.blurPass.scale;
  }

  set scale(value) {
    this._pass.blurPass.scale = value;
  }

  constructor() {
    super();

    this._pass = new BloomPostprocessPass();
  }

  dispose() {
    super.dispose();

    this._pass.dispose();
    this._pass = null;
  }

  onRegister() {
    this.registerPostprocessPass(this._pass);
  }

  onUnregister() {
    this.unregisterPostprocessPass(this._pass);
  }

}
