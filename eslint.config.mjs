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
  {
    files: ["src/backend/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/frontend/**", "@/app/**"],
              message: "Backend katmanı frontend veya route katmanına bağımlı olamaz.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/frontend/**", "@/backend/**", "@/app/**"],
              message: "Shared katmanı yalnızca bağımsız, ortak kod içermelidir.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/backend/infrastructure/database/**"],
              message: "Route katmanı Prisma altyapısına doğrudan erişemez; backend repository veya query modülü kullanın.",
            },
          ],
        },
      ],
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
