import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync, watch } from "fs";
import { dirname } from "path";

const outdir = "dist";
const isWatch = process.argv.includes("--watch");

// Ensure dist directory exists
mkdirSync(outdir, { recursive: true });

if (isWatch) {
  // Watch mode
  const ctx = await esbuild.context({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: `${outdir}/sparklify.js`,
    format: "esm",
    platform: "browser",
    target: "es2022",
    sourcemap: true,
    minify: false,
  });

  const ctxMin = await esbuild.context({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: `${outdir}/sparklify.min.js`,
    format: "esm",
    platform: "browser",
    target: "es2022",
    sourcemap: true,
    minify: true,
  });

  const ctxCSS = await esbuild.context({
    entryPoints: ["src/sparkle.css"],
    bundle: true,
    outfile: `${outdir}/sparklify.min.css`,
    minify: true,
  });

  await Promise.all([ctx.watch(), ctxMin.watch(), ctxCSS.watch()]);

  // Watch for CSS changes to copy unminified version
  watch("src/sparkle.css", () => {
    copyFileSync("src/sparkle.css", `${outdir}/sparklify.css`);
    console.log("✓ CSS copied");
  });

  // Initial CSS copy
  copyFileSync("src/sparkle.css", `${outdir}/sparklify.css`);

  console.log("👀 Watching for changes...");
} else {
  // Build mode
  await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: `${outdir}/sparklify.js`,
    format: "esm",
    platform: "browser",
    target: "es2022",
    sourcemap: true,
    minify: false,
  });

  await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: `${outdir}/sparklify.min.js`,
    format: "esm",
    platform: "browser",
    target: "es2022",
    sourcemap: true,
    minify: true,
  });

  copyFileSync("src/sparkle.css", `${outdir}/sparklify.css`);

  await esbuild.build({
    entryPoints: ["src/sparkle.css"],
    bundle: true,
    outfile: `${outdir}/sparklify.min.css`,
    minify: true,
  });

  console.log("✓ Build complete!");
}
