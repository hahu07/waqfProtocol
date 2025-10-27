import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      ".prettierrc.js",
      "public/workers/auth.worker.js",
      "src/declarations/**",
      "test-crypto-polyfill.js",
    ],
  },
  {
    rules: {
      // Keep no-explicit-any as error - we'll fix all instances
      "@typescript-eslint/no-explicit-any": "error",
      
      // Allow unescaped entities in JSX for better readability
      "react/no-unescaped-entities": "off",
      
      // Allow empty interfaces for type extensions
      "@typescript-eslint/no-empty-object-type": "warn",
      
      // Warn on missing display names
      "react/display-name": "warn",
      
      // Allow require for crypto polyfills
      "@typescript-eslint/no-require-imports": "warn",
      
      // Warn on ts-expect-error without description
      "@typescript-eslint/ban-ts-comment": "warn",
      
      // Keep hooks rules strict
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // Allow unused vars with underscore prefix
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      
      // Warn on img elements instead of error
      "@next/next/no-img-element": "warn",
    },
  },
];

export default eslintConfig;
