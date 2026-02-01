import { Sparkle } from "./Sparkle";

export interface SparkleAnimationOptions {
  target: HTMLElement;
  size?: string;
  colors?: string[];
  animationLength?: number;
  initialDelay?: number;
  pauseMin?: number;
  pauseMax?: number;
}

export class SparkleAnimation {
  private target: HTMLElement;
  private size: string;
  private colors: string[];
  private animationLength: number;
  private initialDelay: number;
  private pauseMin: number;
  private pauseMax: number;
  private animationLengthMin: number;
  private animationLengthMax: number;
  private isRunning: boolean = false;
  private animationController: AbortController = new AbortController();

  constructor(options: SparkleAnimationOptions) {
    this.target = options.target;
    this.size = options.size ?? "20px";
    this.colors = options.colors ?? ["yellow", "white", "gold", "orange"];
    this.animationLength = options.animationLength ?? 700;
    this.initialDelay = options.initialDelay ?? 0;
    this.pauseMin = options.pauseMin ?? 100;
    this.pauseMax = options.pauseMax ?? 500;
    this.animationLengthMin = this.animationLength;
    this.animationLengthMax = this.animationLength * 1.6;
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async runSparkle(animationLength: number): Promise<void> {
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      const sparkle = new Sparkle(this.size, color);

      const domRef = sparkle.getDomRef();
      domRef.style.top = Math.random() * 100 + "%";
      domRef.style.left = Math.random() * 100 + "%";
      domRef.style.setProperty("--animation-length", `${animationLength}ms`);
      
      if (Math.random() < 0.3) { // 30% chance to render behind content
        domRef.style.zIndex = "-1";
      } else {
        domRef.style.zIndex = "2";
      }

      // handle abort
      this.animationController.signal.addEventListener("abort", () => {
        sparkle.destroy();
      });

      this.target.insertAdjacentElement("afterbegin", domRef);

      await this.wait(animationLength);
      sparkle.destroy();
  }

  private async animate(): Promise<void> {
    await this.wait(this.initialDelay);

    while (this.isRunning) {
      const randomAnimationLength =
        Math.random() * (this.animationLengthMax - this.animationLengthMin) +
        this.animationLengthMin;
      await this.runSparkle(randomAnimationLength);
      
      if (!this.isRunning) break;
      
      const pauseDuration = Math.random() * (this.pauseMax - this.pauseMin) + this.pauseMin;
      await this.wait(pauseDuration);
    }
  }

  start(): void {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;

    this.animationController.signal.addEventListener("abort", () => {
      this.isRunning = false;
    });

    this.animate();
  }

  stop(): void {
    this.animationController.abort();
    this.animationController = new AbortController();
  }
}