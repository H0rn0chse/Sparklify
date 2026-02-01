// src/Sparkle.ts
var path = "M26.5 25.5C19.0043 33.3697 0 34 0 34C0 34 19.1013 35.3684 26.5 43.5C33.234 50.901 34 68 34 68C34 68 36.9884 50.7065 44.5 43.5C51.6431 36.647 68 34 68 34C68 34 51.6947 32.0939 44.5 25.5C36.5605 18.2235 34 0 34 0C34 0 33.6591 17.9837 26.5 25.5Z";
var Sparkle = class {
  #root = document.createElement("div");
  size;
  color;
  constructor(size, color) {
    this.size = size;
    this.color = color;
    this.#createHtml();
  }
  #createHtml() {
    this.#root.classList.add("sparkleWrapper");
    this.#root.style.width = this.size;
    const outerSparkle = document.createElement("div");
    outerSparkle.classList.add("outerSparkle");
    outerSparkle.style.width = this.size;
    const innerSparkle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    innerSparkle.setAttribute("viewBox", "0 0 68 68");
    innerSparkle.innerHTML = `<path d="${path}" fill="${this.color}"/>`;
    innerSparkle.classList.add("innerSparkle");
    innerSparkle.style.width = this.size;
    outerSparkle.appendChild(innerSparkle);
    this.#root.appendChild(outerSparkle);
  }
  getDomRef() {
    return this.#root;
  }
  destroy() {
    this.#root.remove();
  }
};

// src/SparkleAnimation.ts
var SparkleAnimation = class {
  target;
  size;
  colors;
  animationLength;
  initialDelay;
  pauseMin;
  pauseMax;
  animationLengthMin;
  animationLengthMax;
  isRunning = false;
  animationController = new AbortController();
  constructor(options) {
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
  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async runSparkle(animationLength) {
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const sparkle = new Sparkle(this.size, color);
    const domRef = sparkle.getDomRef();
    domRef.style.top = Math.random() * 100 + "%";
    domRef.style.left = Math.random() * 100 + "%";
    domRef.style.setProperty("--animation-length", `${animationLength}ms`);
    if (Math.random() < 0.3) {
      domRef.style.zIndex = "-1";
    } else {
      domRef.style.zIndex = "2";
    }
    this.animationController.signal.addEventListener("abort", () => {
      sparkle.destroy();
    });
    this.target.insertAdjacentElement("afterbegin", domRef);
    await this.wait(animationLength);
    sparkle.destroy();
  }
  async animate() {
    await this.wait(this.initialDelay);
    while (this.isRunning) {
      const randomAnimationLength = Math.random() * (this.animationLengthMax - this.animationLengthMin) + this.animationLengthMin;
      await this.runSparkle(randomAnimationLength);
      if (!this.isRunning) break;
      const pauseDuration = Math.random() * (this.pauseMax - this.pauseMin) + this.pauseMin;
      await this.wait(pauseDuration);
    }
  }
  start() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.animationController.signal.addEventListener("abort", () => {
      this.isRunning = false;
    });
    this.animate();
  }
  stop() {
    this.animationController.abort();
    this.animationController = new AbortController();
  }
};
export {
  Sparkle,
  SparkleAnimation
};
//# sourceMappingURL=sparklify.js.map
