import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: resolve(import.meta.dirname),
  publicDir: resolve(import.meta.dirname, "public"),
  build: {
    outDir: resolve(import.meta.dirname, "../dist/site"),
    emptyOutDir: true,
    target: "es2022",
    sourcemap: true,
    // Keep the not-found response as a Vite page rather than an unrelated
    // hand-written file. Azure rewrites real 404 responses to this page, and
    // the shared client shell then supplies the same header, footer, build id,
    // focus handling, and route metadata as an in-app not-found navigation.
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        demo: resolve(import.meta.dirname, "demo.html"),
        privacy: resolve(import.meta.dirname, "privacy.html"),
        terms: resolve(import.meta.dirname, "terms.html"),
        notFound: resolve(import.meta.dirname, "404.html"),
      },
    },
  },
});
