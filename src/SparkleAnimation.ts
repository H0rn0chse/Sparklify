import { Sparkle } from "./Sparkle";
import { randomMinMax } from "./utils";

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
  private isPaused: boolean = false;
  private animationController: AbortController = new AbortController();
  private resolveAfterStop: ((value: unknown) => void) | undefined = undefined;

  constructor(options: SparkleAnimationOptions) {
    this.target = options.target;
    this.size = options.size ?? "1.2rem";
    this.colors = options.colors ?? ["yellow", "white", "gold", "orange"];
    this.animationLength = options.animationLength ?? 700;
    this.initialDelay = options.initialDelay ?? 0;
    this.pauseMin = options.pauseMin ?? 100;
    this.pauseMax = options.pauseMax ?? 500;
    this.animationLengthMin = this.animationLength;
    this.animationLengthMax = this.animationLength * 1.6;
  }

  private wait(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);
      if (signal) {
        signal.addEventListener("abort", () => {
          clearTimeout(timeout);
          reject(new DOMException("Aborted", "AbortError"));
        });
      }
    });
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

      try {
        await this.wait(animationLength, this.animationController.signal);
      } catch {}
      sparkle.destroy();
  }

  private async animate(): Promise<void> {
    this.isPaused = true;
    try {
      await this.wait(this.initialDelay, this.animationController.signal);
    } catch {
      return;
    }
    this.isPaused = false;

    while (this.isRunning) {
      const randomAnimationLength = randomMinMax(this.animationLengthMin, this.animationLengthMax);
      await this.runSparkle(randomAnimationLength);
      
      if (this.resolveAfterStop) {
        this.resolveAfterStop(null);
      }

      if (!this.isRunning) {
        break;
      };
      
      this.isPaused = true;
      const pauseDuration = randomMinMax(this.pauseMin, this.pauseMax);
      try {
        await this.wait(pauseDuration, this.animationController.signal);
      } catch {
        break;
      }
      this.isPaused = false;
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

  async stopOnceDone(): Promise<void> {
    if (!this.isRunning || this.isPaused) {
      this.stop();
      return;
    }

    const stopOnceDoneDeferred = Promise.withResolvers();
    this.resolveAfterStop = stopOnceDoneDeferred.resolve;
    await stopOnceDoneDeferred.promise;
    this.resolveAfterStop = undefined;
    this.stop();
  }
}