import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/domains/*/*"],
              message: "Deep imports into domains are forbidden. Import from the domain's public index.ts instead (e.g. `@/domains/courses`). Internal domain files must use relative imports.",
            },
            {
              group: ["@/mock/*", "@/mock", "mock/*"],
              message: "mock/ is dev-only fixture data. Only infrastructure/http/api.ts, apps/core/components/AuthInitializer.tsx and app/api/mock/** may import from it — everything else must go through the real API layer. See mock/README.md.",
            }
          ]
        }
      ]
    }
  },
  // The designated mock-mode consumers are allowed to import from mock/.
  {
    files: [
      "infrastructure/http/api.ts",
      "apps/core/components/AuthInitializer.tsx",
      "app/api/mock/**",
      "app/dev-preview/**",
      "mock/**",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/domains/*/*"],
              message: "Deep imports into domains are forbidden. Import from the domain's public index.ts instead (e.g. `@/domains/courses`). Internal domain files must use relative imports.",
            }
          ]
        }
      ]
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
