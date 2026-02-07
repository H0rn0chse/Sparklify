import { parseCssSize } from "../utils";
import { AnimationHandler } from "./AnimationHandler";

const libraryStylesTemplate = document.createElement("template");
libraryStylesTemplate.innerHTML = "<style>STYLE_CONTENT_PLACEHOLDER</style>";

class Sparklify extends HTMLElement {
  private handler: AnimationHandler = new AnimationHandler();

  static get observedAttributes() {
    return ["count", "colors", "size", "speed"];
  }

  connectedCallback() { 
    // Create a shadow root
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
        "orange",
      ],
      size: this.getAttribute("size") || "20px",
      speed: parseInt(this.getAttribute("speed") || "0", 10) || 1000,
    };

    this.handler.setCount(options.count);
    this.handler.setColors(options.colors);
    this.handler.setSize(options.size);
    this.handler.setSpeed(options.speed);

    this.handler.init(defaultSlowWrapper);
  }

  disconnectedCallback() {
    // Clean up animations when element is removed
    this.handler.destroy();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (newValue == undefined || oldValue === newValue) {
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

  setCount(count: number) {
    this.handler.setCount(count);
    this.setAttribute("count", count.toString());
  }

  setColors(colors: string[]) {
    this.handler.setColors(colors);
    this.setAttribute("colors", colors.join(","));
  }

  setSize(size: string) {
    this.handler.setSize(size);
    this.setAttribute("size", size);
  }

  setSpeed(speed: number) {
    this.handler.setSpeed(speed);
    this.setAttribute("speed", speed.toString());
  }
}

window.customElements.define("sparklify-content", Sparklify);
