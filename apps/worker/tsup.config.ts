import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  sourcemap: true,
  clean: true,
  target: "node18",
  dts: true,
  external: ["pg-native", "dotenv"],
});
