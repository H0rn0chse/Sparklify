import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync, watch, rmSync } from "fs";
import { execSync } from "child_process";

// ===== Configuration =====
const PATHS = {
  outDir: "dist",
  tempDts: ".temp-dts",
  src: {
    entry: "src/index.ts",
    css: "src/sparkle.css",
  },
  dist: {
    js: "dist/sparklify.js",
    jsMin: "dist/sparklify.min.js",
    css: "dist/sparklify.css",
    cssMin: "dist/sparklify.min.css",
    dts: "dist/sparklify.d.ts",
  },
};

const ESBUILD_CONFIG = {
  format: "esm",
  platform: "browser",
  target: "es2022",
  sourcemap: true,
};

// ===== Setup =====
const isWatch = process.argv.includes("--watch");
mkdirSync(PATHS.outDir, { recursive: true });

// ===== Build Functions =====
function generateDeclarations() {
  execSync(`tsc --emitDeclarationOnly --outDir ${PATHS.tempDts}`, {
    stdio: "inherit",
  });
  execSync(
    `dts-bundle-generator -o ${PATHS.dist.dts} ${PATHS.tempDts}/index.d.ts`,
    { stdio: "inherit" },
  );
  rmSync(PATHS.tempDts, { recursive: true, force: true });
}

function copyCSS() {
  copyFileSync(PATHS.src.css, PATHS.dist.css);
}

async function buildJS() {
  await Promise.all([
    // Main bundle
    esbuild.build({
      entryPoints: [PATHS.src.entry],
      bundle: true,
      outfile: PATHS.dist.js,
      ...ESBUILD_CONFIG,
      minify: false,
    }),
    // Minified bundle
    esbuild.build({
      entryPoints: [PATHS.src.entry],
      bundle: true,
      outfile: PATHS.dist.jsMin,
      ...ESBUILD_CONFIG,
      minify: true,
    }),
  ]);
}

async function buildCSS() {
  copyCSS();
  await esbuild.build({
    entryPoints: [PATHS.src.css],
    bundle: true,
    outfile: PATHS.dist.cssMin,
    minify: true,
  });
}

// ===== Watch Mode =====
async function runWatchMode() {
  // Create esbuild contexts
  const [jsCtx, jsMinCtx, cssCtx] = await Promise.all([
    esbuild.context({
      entryPoints: [PATHS.src.entry],
      bundle: true,
      outfile: PATHS.dist.js,
      ...ESBUILD_CONFIG,
      minify: false,
    }),
    esbuild.context({
      entryPoints: [PATHS.src.entry],
      bundle: true,
      outfile: PATHS.dist.jsMin,
      ...ESBUILD_CONFIG,
      minify: true,
    }),
    esbuild.context({
      entryPoints: [PATHS.src.css],
      bundle: true,
      outfile: PATHS.dist.cssMin,
      minify: true,
    }),
  ]);

  // Start watching
  await Promise.all([jsCtx.watch(), jsMinCtx.watch(), cssCtx.watch()]);

  // Watch CSS for unminified copy
  watch(PATHS.src.css, () => {
    copyCSS();
    console.log("✓ CSS copied");
  });

  // Watch TypeScript files for declarations
  watch("src", { recursive: true }, (eventType, filename) => {
    if (filename?.endsWith(".ts")) {
      console.log("Regenerating declarations...");
      generateDeclarations();
      console.log("✓ Declarations updated");
    }
  });

  // Initial build
  copyCSS();
  generateDeclarations();

  console.log("👀 Watching for changes...");
}

// ===== Build Mode =====
async function runBuildMode() {
  await buildJS();
  await buildCSS();
  generateDeclarations();
  console.log("✓ Build complete!");
}

// ===== Main =====
if (isWatch) {
  await runWatchMode();
} else {
  await runBuildMode();
}
