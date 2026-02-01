# Sparklify

A lightweight, easy-to-use library for adding sparkle animations to your web projects.
Inspired by the react guide of Josh Comeau: https://www.joshwcomeau.com/react/animated-sparkles-in-react/

## Installation

```bash
npm install @h0rn0chse/sparklify
```

## Usage

### Import of Web Component

tbd

### Import the library

```javascript
import { SparkleAnimation } from "@h0rn0chse/sparklify";
import "@h0rn0chse/sparklify/css";
```

### Create a sparkle animation

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

## API

### `SparkleAnimation`

The `SparkleAnimation` creates sparkles at random positions within the provided target `HTMLElement`. This target needs to be **positioned relative**. After each animation cycle the animation pauses for a random amount of time to be more sparkly.

#### Constructor Options

- `target` (HTMLElement) - **Required**: The element where sparkles will appear. The target needs to be positioned relative.
- `size` (string) - Default: `'20px'`: Size of each sparkle
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
