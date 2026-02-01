// Sparkles from https://www.joshwcomeau.com/react/animated-sparkles-in-react/
const path =
  "M26.5 25.5C19.0043 33.3697 0 34 0 34C0 34 19.1013 35.3684 26.5 43.5C33.234 50.901 34 68 34 68C34 68 36.9884 50.7065 44.5 43.5C51.6431 36.647 68 34 68 34C68 34 51.6947 32.0939 44.5 25.5C36.5605 18.2235 34 0 34 0C34 0 33.6591 17.9837 26.5 25.5Z";

export class Sparkle {
  #root: HTMLDivElement = document.createElement("div");
  size: string;
  color: string;

  constructor(size: string, color: string) {
    this.size = size;
    this.color = color;

    this.#createHtml();
  }

  #createHtml(): void {
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

  getDomRef(): HTMLDivElement {
    return this.#root;
  }

  destroy(): void {
    this.#root.remove();
  }
}
