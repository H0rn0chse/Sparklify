import * as esbuild from "esbuild";
import {
  copyFileSync,
  mkdirSync,
  watch,
  rmSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { execSync } from "child_process";

// ===== Configuration =====
const PATHS = {
  outDir: "dist",
  tempDts: ".temp-dts",
  src: {
    entry: "src/index.ts",
    webComponent: "src/webcomponent/index.ts",
    css: "src/sparkle.css",
  },
  dist: {
    js: "dist/sparklify.js",
    jsMin: "dist/sparklify.min.js",
    webComponent: "dist/sparklify-webcomponent.js",
    webComponentMin: "dist/sparklify-webcomponent.min.js",
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

function injectCSSIntoWebComponent() {
  // Read the CSS content
  const cssContent = readFileSync(PATHS.src.css, "utf-8");

  // Inject CSS into web component bundles
  [PATHS.dist.webComponent, PATHS.dist.webComponentMin].forEach((filePath) => {
    try {
      let content = readFileSync(filePath, "utf-8");

      // For regular strings, escape quotes and backslashes
      const escapedCSS = cssContent.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      content = content.replace(
        '"<style>STYLE_CONTENT_PLACEHOLDER</style>"',
        `\`<style>${escapedCSS}</style>\``,
      );

      writeFileSync(filePath, content, "utf-8");
    } catch (error) {
      console.error(`Skipped CSS injection into ${filePath}:`, error);
    }
  });

  console.log("✓ CSS injected into web component");
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
    // Web component bundle
    esbuild.build({
      entryPoints: [PATHS.src.webComponent],
      bundle: true,
      outfile: PATHS.dist.webComponent,
      ...ESBUILD_CONFIG,
      minify: false,
    }),
    // Web component minified bundle
    esbuild.build({
      entryPoints: [PATHS.src.webComponent],
      bundle: true,
      outfile: PATHS.dist.webComponentMin,
      ...ESBUILD_CONFIG,
      minify: true,
    }),
  ]);

  // Inject CSS into web component after building
  injectCSSIntoWebComponent();
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
  // Plugin to inject CSS after web component builds
  const cssInjectionPlugin = {
    name: "css-injection",
    setup(build) {
      build.onEnd(() => {
        injectCSSIntoWebComponent();
      });
    },
  };

  // Create esbuild contexts
  const [jsCtx, jsMinCtx, webComponentCtx, webComponentMinCtx, cssCtx] =
    await Promise.all([
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
        entryPoints: [PATHS.src.webComponent],
        bundle: true,
        outfile: PATHS.dist.webComponent,
        ...ESBUILD_CONFIG,
        minify: false,
        plugins: [cssInjectionPlugin],
      }),
      esbuild.context({
        entryPoints: [PATHS.src.webComponent],
        bundle: true,
        outfile: PATHS.dist.webComponentMin,
        ...ESBUILD_CONFIG,
        minify: true,
        plugins: [cssInjectionPlugin],
      }),
      esbuild.context({
        entryPoints: [PATHS.src.css],
        bundle: true,
        outfile: PATHS.dist.cssMin,
        minify: true,
      }),
    ]);

  // Start watching
  await Promise.all([
    jsCtx.watch(),
    jsMinCtx.watch(),
    webComponentCtx.watch(),
    webComponentMinCtx.watch(),
    cssCtx.watch(),
  ]);

  // Watch CSS for unminified copy and web component injection
  watch(PATHS.src.css, () => {
    copyCSS();
    // CSS injection will be triggered by web component rebuild via plugin
    console.log("✓ CSS copied");
  });

  // Watch TypeScript files for declarations (debounced)
  let declarationTimeout;
  watch("src", { recursive: true }, (eventType, filename) => {
    if (filename?.endsWith(".ts")) {
      clearTimeout(declarationTimeout);
      declarationTimeout = setTimeout(() => {
        console.log("Regenerating declarations...");
        generateDeclarations();
        console.log("✓ Declarations updated");
      }, 300);
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
