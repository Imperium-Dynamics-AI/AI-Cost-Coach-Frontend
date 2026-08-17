import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [js.configs.recommended, reactHooks.configs["recommended-latest"], reactRefresh.configs.vite],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: { react },
    rules: {
      "react/jsx-uses-vars": "error",
    },
  },
  {
    // Tests run under `node --test`, not in a browser. Without this they inherit the
    // browser globals above, so the first test to reach for `process` or `Buffer`
    // fails no-undef for a reason that has nothing to do with the code under test.
    files: ["**/*.test.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
]);
