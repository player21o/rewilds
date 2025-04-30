import { AnimatedSprite, Texture } from "pixi.js";

export type Animations = { [anim: string]: Texture[] };

export class AdvancedAnimatedSprite extends AnimatedSprite {
  public animations: Animations;

  public constructor(anims: Animations, animation: keyof Animations) {
    super(anims[animation]);

    this.animations = anims;
    this.set_animation(animation);
  }

  public set_animation(anim: keyof Animations) {
    const frame = this.currentFrame;

    this.textures = this.animations[anim];
    //this.currentFrame = frame;

    this.play();
  }
}
