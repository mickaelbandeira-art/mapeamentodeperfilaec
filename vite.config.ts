import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()].filter(Boolean),
  define: {
    "process.env.GOOGLE_API_KEY": JSON.stringify(process.env.GOOGLE_API_KEY || ""),
    "process.env.VITE_GOOGLE_API_KEY": JSON.stringify(process.env.VITE_GOOGLE_API_KEY || ""),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
