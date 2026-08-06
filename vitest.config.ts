import path from "path";
import { defineConfig } from "vitest/config";

// Separate from vite.config.ts on purpose — the Tailwind plugin has no role
// in a jsdom test environment, and keeping the app build config untouched
// avoids coupling the production bundle to test-only concerns.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: false,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
