import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/server.ts"],
    format: ["esm"],
    target: "esnext",   // node 18
    outDir: "dist",
    clean: true,
    bundle: true,
    splitting: false,
    sourcemap: true,
});