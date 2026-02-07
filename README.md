# Sparklify

A lightweight, easy-to-use library for adding sparkle animations to your web projects.
Inspired by the react guide of Josh Comeau: https://www.joshwcomeau.com/react/animated-sparkles-in-react/

## Installation

The library is available via [npm](https://www.npmjs.com/package/@h0rn0chse/sparklify)

```bash
npm install @h0rn0chse/sparklify
```

## Usage

### General

Sparklify creates animated sparkle elements that appear at random positions within a target element. Each sparkle smoothly fades in and out over a configurable duration, with random pauses between animations for a natural sparkly effect.

Sparkles toggle their `z-index` between `-1` and `2` in both the web component and the library. If you want sparkles to appear only in front of or only behind your content, set an explicit `z-index` on the target content (or its children) so the stacking order is deterministic.

### Usage via Web Component

Import the module

```javascript
import "@h0rn0chse/sparklify/webcomponent";
```

or use the CDN of your choice

```html
<script src="https://unpkg.com/@h0rn0chse/sparklify/dist/sparklify-webcomponent.min.js"></script>
```

And create a sparkle animation

```html
<sparklify-content
  count="3"
  colors="yellow,white,gold,orange"
  size="2rem"
  speed="1000"
>
  <p>target element</p>
</sparklify-content>
```

### Usage via Library

Import the module

```javascript
import { SparkleAnimation } from "@h0rn0chse/sparklify";
import "@h0rn0chse/sparklify/css";
```

or use the CDN of your choice

```html
<script src="https://unpkg.com/@h0rn0chse/sparklify/dist/sparklify.min.js"></script>
<link
  rel="stylesheet"
  href="https://unpkg.com/@h0rn0chse/sparklify/dist/sparklify.css"
/>
```

And create a sparkle animation

```javascript
const target = document.getElementById("target");

const animation = new SparkleAnimation({
  target, // Required: target element
  size: "20px", // Optional: sparkle size
  colors: ["yellow", "white", "gold", "orange"], // Optional: sparkle colors
  animationLength: 1000, // Optional: animation duration in ms
  initialDelay: 500, // Optional: delay before starting
  pauseMin: 100, // Optional: minimum pause between sparkles
  pauseMax: 500, // Optional: maximum pause between sparkles
});

// Start the animation
animation.start();

// Stop the animation
animation.stop();
```

## WebComponent API

### `sparklify-content`

Custom element that renders sparkles around its slotted content. The element wraps the slot in a positioned container, so you don't need to set `position: relative` on the slotted element. Additionally the web component has `display: inline-block` by default.

#### Attributes

- `count` (number) - Default: `3`: Number of concurrent sparkle animations
- `colors` (string) - Default: `"yellow,white,gold,orange"`: Comma-separated list of colors
- `size` (string) - Default: `"20px"`: Base sparkle size (any valid CSS size)
- `speed` (number) - Default: `1000`: Duration of each sparkle animation in milliseconds

All attributes are reactive and can be changed at runtime.

## Library API

### `SparkleAnimation`

The `SparkleAnimation` creates sparkles at random positions within the provided target `HTMLElement`. This target needs to be **positioned relative** and **displayed as inline-block**. After each animation cycle the animation pauses for a random amount of time to be more sparkly.

You can apply the built-in `sparklify-target` CSS class to satisfy these requirements:

```html
<span id="target" class="sparklify-target">Sparkle me</span>
```

#### Constructor Options

- `target` (HTMLElement) - **Required**: The element where sparkles will appear. The target needs to be positioned relative.
- `size` (string) - Default: `'1.2rem'`: Size of each sparkle
- `colors` (string[]) - Default: `['yellow', 'white', 'gold', 'orange']`: Array of colors for sparkles
- `animationLength` (number) - Default: `1000`: Duration of each sparkle animation in milliseconds
- `initialDelay` (number) - Default: `0`: Delay before first sparkle appears in milliseconds
- `pauseMin` (number) - Default: `100`: Minimum pause between sparkles in milliseconds
- `pauseMax` (number) - Default: `500`: Maximum pause between sparkles in milliseconds

#### Methods

- `start()`: Start the sparkle animation
- `stop()`: Stop the sparkle animation

## License

MIT
