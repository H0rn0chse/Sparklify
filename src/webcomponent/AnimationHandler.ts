import { SparkleAnimation } from "../SparkleAnimation";
import { parseCssSize, randomMinMax } from "../utils";

export class AnimationHandler {
  private count: number = 3;
  private colors: string[] = ["yellow", "white", "gold", "orange"];
  private size: string = "1.2rem";
  private speed: number = 1000;
  private target: HTMLElement | null = null;
  private initialized: boolean = false;
  private animations: SparkleAnimation[] = [];
  private isUpdating: boolean = false;
  private pendingUpdate: boolean = false;

  setCount(count: number): void {
    this.count = count;
    this.scheduleUpdate();
  }

  setColors(colors: string[]): void {
    this.colors = colors;
    this.scheduleUpdate();
  }

  setSize(size: string): void {
    this.size = size;
    this.scheduleUpdate();
  }

  setSpeed(speed: number): void {
    this.speed = speed;
    this.scheduleUpdate();
  }

  private scheduleUpdate(): void {
    if (!this.initialized) return;
    if (this.isUpdating) {
      this.pendingUpdate = true;
      return;
    }
    this.updateAnimations();
  }

  async updateAnimations(initialRun: boolean = false): Promise<void> {
    if (!this.target) return;

    this.isUpdating = true;
    this.pendingUpdate = false;

    if (!initialRun) {
      await Promise.all(this.animations.map(async (animation) => {
        await animation.stopOnceDone();
      }));
  
      // Clear the animations array
      this.animations = [];
    }

    // Create new animations based on current settings
    let initialDelay = 0;
    const sizeDetails = parseCssSize(this.size);

    for (let i = 0; i < this.count; i++) {
      const speedAndSizeFactor = randomMinMax(0.5, 1);
      const animation = new SparkleAnimation({
        target: this.target,
        size: `${sizeDetails.value * speedAndSizeFactor}${sizeDetails.unit}`,
        colors: this.colors,
        animationLength: this.speed * speedAndSizeFactor,
        initialDelay: initialDelay, // staggered start
      });
      animation.start();
      this.animations.push(animation);

      initialDelay += randomMinMax(100, 300);
    }

    this.isUpdating = false;

    // If there was a pending update, process it now
    if (this.pendingUpdate) {
      await this.updateAnimations();
    }
  }

  async init(target: HTMLElement): Promise<void> {
    this.target = target;
    this.initialized = true;
    await this.updateAnimations(true);
  }

  destroy(): void {
    this.animations.forEach((animation) => animation.stop());
    this.animations = [];
    this.target = null;
  }
}
