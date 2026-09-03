import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    // Existing code is migrated incrementally; keep these visible without
    // making the newly introduced lint command unusable on day one.
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "hayattan/**",
    "hayattan 2/**",
    "cloudflare-worker/**",
    "scripts/**",
  ]),
]);
