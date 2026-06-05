import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" keeps asset paths relative so the build works whether it is served
// from a domain root (Firebase Hosting) or a subdirectory (GitHub Pages /repo/).
// This avoids the basePath/subdirectory issues common on GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
