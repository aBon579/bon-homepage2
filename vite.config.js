import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      // 编辑器/写入工具的瞬态临时目录（.xxx.tmpdir）不参与监听，避免 EBUSY 崩溃
      ignored: ["**/*.tmpdir/**", "**/.*.tmpdir/**"],
    },
  },
});
