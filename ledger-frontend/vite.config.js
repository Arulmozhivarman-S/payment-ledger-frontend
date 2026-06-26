import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During `npm run dev`, requests to the backend routes below are proxied to
// the Spring Boot server, so the browser sees them as same-origin and CORS
// never comes into play. Change the target if your backend runs elsewhere.
const BACKEND = process.env.BACKEND_URL || "http://localhost:8080";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/login": BACKEND,
      "/register": BACKEND,
      "/accounts": BACKEND,
      "/transfers": BACKEND,
    },
  },
});
