import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";

const eslintConfig = [
  {
    ignores: [".next/**", "**/.next/**", "node_modules/**", "**/node_modules/**", "playwright-report/**", "coverage/**", ".runtime/**", "taglish-credibility-checker-main/**", "**/__pycache__/**", "**/*.pyc"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextVitals,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "react/no-unescaped-entities": "off"
    },
  },
];

export default eslintConfig;
