// @ts-check

import eslintJs from "@eslint/js";
import typescriptEslintParser from "@typescript-eslint/parser";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import prettierConfig from "eslint-config-prettier"; // Assuming prettier is used for formatting rules
import globals from "globals";

export default [
  // Global ignores
  {
    ignores: [
      "**/*.js.map",
      "**/*.d.ts.map",
      // "**/*.d.ts", // .d.ts files should be linted for type correctness by tsc, but ESLint might have opinions. Let's see.
      "build/",
      "dist/",
      "node_modules/",
      "core/**/*.js", // Already specified as only TS should be in core
      "contracts/**/*.js", // Already specified as only TS should be in contracts
      "src/utils/__tests__/eventBus.test.js",
      // "*.config.js", // We are creating eslint.config.js, so it shouldn't ignore itself. Other .config.js might be fine.
      // "*.config.ts" // Similarly, vite.config.ts etc. should be lintable.
      "babel.config.js", // Example specific config files to ignore
      "postcss.config.js",
      "tailwind.config.js",
      "vite.config.js",
      "vitest.config.ts",
      "config-overrides.js", // From project root
      "server/src/global.d.ts" // Specific d.ts file
    ]
  },

  // ESLint recommended rules
  eslintJs.configs.recommended,

  // TypeScript configuration
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.json", "./server/tsconfig.json"],
        tsconfigRootDir: ".",
        warnOnUnsupportedTypeScriptVersion: false,
      },
      globals: {
        ...globals.node, // Using import from 'globals' package
        vi: "readonly", // From original globals
      }
    },
    plugins: {
      "@typescript-eslint": typescriptEslintPlugin,
    },
    rules: {
      ...typescriptEslintPlugin.configs.recommended.rules,
      // From original rules:
      "no-unused-vars": "off", // Base rule disabled, prefer @typescript-eslint version
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      "no-undef": "error",
      "no-prototype-builtins": "warn",
    },
  },

  // React configuration
  {
    files: ["**/*.jsx", "**/*.tsx"], // Apply to TSX as well
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
      globals: {
        browser: true, // From original env
      }
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // For new JSX transform
      "react/prop-types": "off", // From original rules
    },
  },

  // Specific overrides for core and server (stricter rules)
  {
    files: ["core/**/*.ts", "core/**/*.tsx", "server/src/**/*.ts", "server/src/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-inferrable-types": "error", // Was "error" in original plan
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/no-var-requires": "error",
    },
  },

  // Node.js environment for server and core files
  {
    files: ["server/src/**/*.ts", "core/**/*.ts"],
    languageOptions: {
      globals: {
        node: true, // From original env
      }
    }
  },

  // Jest environment for test files
  {
    files: ["**/*.test.js", "**/*.test.jsx", "**/*.test.ts", "**/*.test.tsx", "src/__tests__/**/*.js"],
    languageOptions: {
      globals: {
        jest: true, // From original env
        vi: "readonly" // Vitest globals
      }
    },
    rules: {
      // Specific rules for tests if needed
    }
  },

  // Prettier config should be last to override other formatting rules
  prettierConfig,
];
