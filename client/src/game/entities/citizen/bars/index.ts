import {UniformGroup} from 'pixi.js';

import {moveTo} from '../../../../game/utils';
import type {Citizen} from '../index';

export function update_bars(this: Citizen, dt: number) {
  const params = this.bar_params;
  const bars = this.sprites?.bars;
  if (!bars || !bars.shader) return;

  // 1. Smoothly interpolate stamina
  this.bar_params.current_stamina = moveTo(
      this.bar_params.current_stamina,
      this.bar_params.stamina,
      Math.abs(this.bar_params.current_stamina - this.bar_params.stamina) *
          (dt / 50) * 2.0,
  );

  // 2. Position the mesh at citizen's feet anchor
  bars.position.set(250 / 4 - 3, 250 / 4 + 62 - 50);

  // 3. Fall back through data.health / data.maxHealth (common in constants)
  const maxHealth = (this.shared as any).maxHealth ?? this?.health ??
      this.data?.maxHealth ?? 100;

  const currentHealth = this.shared?.health ?? maxHealth;
  const healthRatio =
      maxHealth > 0 ? Math.max(0, Math.min(1, currentHealth / maxHealth)) : 0;

  // 4. Update uniforms and notify the GPU
  const uniformGroup = bars.shader.resources.barUniforms as UniformGroup;
  const uniforms = uniformGroup.uniforms;

  uniforms.uHealth = healthRatio;
  uniforms.uStamina = Math.max(0, Math.min(1, params.current_stamina));
  uniforms.uHideStamina = params.hide_stamina ? 1.0 : 0.0;
  uniforms.uHealthColor = !params.enemy ?
      [0.2157, 0.5804, 0.4314]  // 0x37946e (friendly green)
      :
      [0.6667, 0.0, 0.0];  // 0xaa0000 (enemy red)

  uniformGroup.update();
}