// src/utils.ts
function randomMinMax(min, max) {
  return Math.random() * (max - min) + min;
}
function parseCssSize(size) {
  const regex = /^([\d.]+)([a-z%]+)$/i;
  const match = size.match(regex);
  if (!match) {
    throw new Error(`Invalid CSS size: ${size}`);
  }
  return {
    value: parseFloat(match[1]),
    unit: match[2]
  };
}

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
    this.#root.classList.add("sparklify-sparkleWrapper");
    this.#root.style.width = this.size;
    const outerSparkle = document.createElement("div");
    outerSparkle.classList.add("sparklify-outerSparkle");
    outerSparkle.style.width = this.size;
    const innerSparkle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    innerSparkle.setAttribute("viewBox", "0 0 68 68");
    innerSparkle.innerHTML = `<path d="${path}" fill="${this.color}"/>`;
    innerSparkle.classList.add("sparklify-innerSparkle");
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
  isPaused = false;
  animationController = new AbortController();
  resolveAfterStop = void 0;
  constructor(options) {
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
  wait(ms, signal) {
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
    try {
      await this.wait(animationLength, this.animationController.signal);
    } catch {
    }
    sparkle.destroy();
  }
  async animate() {
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
      }
      ;
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
  async stopOnceDone() {
    if (!this.isRunning || this.isPaused) {
      this.stop();
      return;
    }
    const stopOnceDoneDeferred = Promise.withResolvers();
    this.resolveAfterStop = stopOnceDoneDeferred.resolve;
    await stopOnceDoneDeferred.promise;
    this.resolveAfterStop = void 0;
    this.stop();
  }
};

// src/webcomponent/AnimationHandler.ts
var AnimationHandler = class {
  count = 3;
  colors = ["yellow", "white", "gold", "orange"];
  size = "1.2rem";
  speed = 1e3;
  target = null;
  initialized = false;
  animations = [];
  isUpdating = false;
  pendingUpdate = false;
  setCount(count) {
    this.count = count;
    this.scheduleUpdate();
  }
  setColors(colors) {
    this.colors = colors;
    this.scheduleUpdate();
  }
  setSize(size) {
    this.size = size;
    this.scheduleUpdate();
  }
  setSpeed(speed) {
    this.speed = speed;
    this.scheduleUpdate();
  }
  scheduleUpdate() {
    if (!this.initialized) return;
    if (this.isUpdating) {
      this.pendingUpdate = true;
      return;
    }
    this.updateAnimations();
  }
  async updateAnimations(initialRun = false) {
    if (!this.target) return;
    this.isUpdating = true;
    this.pendingUpdate = false;
    if (!initialRun) {
      await Promise.all(this.animations.map(async (animation) => {
        await animation.stopOnceDone();
      }));
      this.animations = [];
    }
    let initialDelay = 0;
    const sizeDetails = parseCssSize(this.size);
    for (let i = 0; i < this.count; i++) {
      const speedAndSizeFactor = randomMinMax(0.5, 1);
      const animation = new SparkleAnimation({
        target: this.target,
        size: `${sizeDetails.value * speedAndSizeFactor}${sizeDetails.unit}`,
        colors: this.colors,
        animationLength: this.speed * speedAndSizeFactor,
        initialDelay
        // staggered start
      });
      animation.start();
      this.animations.push(animation);
      initialDelay += randomMinMax(100, 300);
    }
    this.isUpdating = false;
    if (this.pendingUpdate) {
      await this.updateAnimations();
    }
  }
  async init(target) {
    this.target = target;
    this.initialized = true;
    await this.updateAnimations(true);
  }
  destroy() {
    this.animations.forEach((animation) => animation.stop());
    this.animations = [];
    this.target = null;
  }
};

// src/webcomponent/index.ts
var libraryStylesTemplate = document.createElement("template");
libraryStylesTemplate.innerHTML = `<style>.sparklify-target {
  position: relative;
  display: inline-block;
}

@keyframes sparklify-rotate-sparkle {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(180deg);
  }
}

@keyframes sparklify-scale-sparkle {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}

.sparklify-sparkleWrapper,
.sparklify-sparkleWrapper * {
  pointer-events: none;
}

.sparklify-sparkleWrapper {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;

  --animation-length: 600ms;

  transform: translate(-50%, -50%);
}

.sparklify-outerSparkle {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: sparklify-scale-sparkle var(--animation-length) ease-in-out
    forwards;
}

.sparklify-innerSparkle {
  animation: sparklify-rotate-sparkle var(--animation-length) linear forwards;
}
</style>`;
var Sparklify = class extends HTMLElement {
  handler = new AnimationHandler();
  static get observedAttributes() {
    return ["count", "colors", "size", "speed"];
  }
  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: "open" });
    const libraryStyles = libraryStylesTemplate.content.cloneNode(true);
    shadowRoot.appendChild(libraryStyles);
    const wcStyles = document.createElement("style");
    shadowRoot.appendChild(wcStyles);
    wcStyles.sheet?.insertRule(`
      :host {
        display: inline-block;
      }
    `);
    const slot = document.createElement("slot");
    slot.addEventListener("slotchange", () => {
      this.handler.updateAnimations();
    });
    const defaultSlowWrapper = document.createElement("div");
    defaultSlowWrapper.style.position = "relative";
    defaultSlowWrapper.appendChild(slot);
    shadowRoot.appendChild(defaultSlowWrapper);
    const options = {
      count: parseInt(this.getAttribute("count") || "0", 10) || 3,
      colors: this.getAttribute("colors")?.split(",") || [
        "yellow",
        "white",
        "gold",
        "orange"
      ],
      size: this.getAttribute("size") || "20px",
      speed: parseInt(this.getAttribute("speed") || "0", 10) || 1e3
    };
    this.handler.setCount(options.count);
    this.handler.setColors(options.colors);
    this.handler.setSize(options.size);
    this.handler.setSpeed(options.speed);
    this.handler.init(defaultSlowWrapper);
  }
  disconnectedCallback() {
    this.handler.destroy();
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue == void 0 || oldValue === newValue) {
      return;
    }
    switch (name) {
      case "count":
        this.setCount(parseInt(newValue, 10));
        break;
      case "colors":
        this.setColors(newValue.split(","));
        break;
      case "size":
        try {
          parseCssSize(newValue);
        } catch (error) {
          console.error(error);
          return;
        }
        this.setSize(newValue);
        break;
      case "speed":
        this.setSpeed(parseInt(newValue, 10));
        break;
      default:
        throw new Error(`The property ${name} is not supported`);
    }
  }
  setCount(count) {
    this.handler.setCount(count);
    this.setAttribute("count", count.toString());
  }
  setColors(colors) {
    this.handler.setColors(colors);
    this.setAttribute("colors", colors.join(","));
  }
  setSize(size) {
    this.handler.setSize(size);
    this.setAttribute("size", size);
  }
  setSpeed(speed) {
    this.handler.setSpeed(speed);
    this.setAttribute("speed", speed.toString());
  }
};
window.customElements.define("sparklify-content", Sparklify);
//# sourceMappingURL=sparklify-webcomponent.js.map
