import { SparkleAnimation } from "./libs/sparklify/sparklify.js";

const target = document.getElementById("target");

[
  new SparkleAnimation({
    target,
    size: "2rem",
  }),
  new SparkleAnimation({
    target,
    size: "1.3rem",
    animationLength: 500,
    initialDelay: 300,
  }),
  new SparkleAnimation({
    target,
    size: "1.3rem",
    animationLength: 600,
    initialDelay: 400,
  }),
].forEach((animation) => animation.start());
