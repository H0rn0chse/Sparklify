import { SparkleAnimation } from "./libs/sparklify/sparklify.js";

const target = document.getElementById("target");

// Using the new SparkleAnimation class
[
  new SparkleAnimation({
    target,
    size: "1.2rem",
  }),
  new SparkleAnimation({
    target,
    size: "0.8rem",
    animationLength: 500,
    initialDelay: 300,
  }),
  new SparkleAnimation({
    target,
    size: "0.8rem",
    animationLength: 600,
    initialDelay: 400,
  }),
].forEach((animation) => animation.start());

// Example: Add controls to start/stop the animation
// Uncomment below to add interactive controls

// const startBtn = document.createElement("button");
// startBtn.textContent = "Start";
// startBtn.onclick = () => animation.start();
// document.body.appendChild(startBtn);

// const stopBtn = document.createElement("button");
// stopBtn.textContent = "Stop";
// stopBtn.onclick = () => animation.stop();
// document.body.appendChild(stopBtn);
