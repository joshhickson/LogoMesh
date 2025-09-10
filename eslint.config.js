// @ts-check

import eslintJs from "@eslint/js";
import typescriptEslintParser from "@typescript-eslint/parser";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import importPlugin from "eslint-plugin-import";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // Global ignores
  {
    ignores: [
      "**/*.js.map",
      "**/*.d.ts.map",
      "build/",
      "dist/",
      "node_modules/",
      "*.config.js",
      "*.config.ts",
      "server/src/global.d.ts"
    ]
  },

  // Base config for all files
  {
    plugins: {
      react: reactPlugin,
      "@typescript-eslint": typescriptEslintPlugin,
      "import": importPlugin,
    },
    languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
  },

  // TypeScript configuration (with type checking)
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: ["./tsconfig.json", "./server/tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        "vi": "readonly",
      },
    },
    rules: {
      ...eslintJs.configs.recommended.rules,
      ...typescriptEslintPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
    settings: {
      "import/resolver": {
        "typescript": {}
      },
      react: {
        version: "18.2",
      },
    },
  },

  // JavaScript and JSX configuration (without type checking)
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      }
    },
    rules: {
       ...eslintJs.configs.recommended.rules,
       ...reactPlugin.configs.recommended.rules,
       "react/react-in-jsx-scope": "off",
       "react/prop-types": "off",
    }
  },

  // Stricter rules for core and server
  {
    files: ["core/**/*.ts", "core/**/*.tsx", "server/src/**/*.ts", "server/src/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/no-var-requires": "error",
    },
  },

  // Prettier config - must be last
  prettierConfig,
];
