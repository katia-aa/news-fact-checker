import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/news-fact-checker/",
  build: {
    outDir: "dist", // This should point to your output directory
    rollupOptions: {
      input: "index.html", // Ensure the input HTML is correct
    },
  },
});
