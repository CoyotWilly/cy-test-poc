// ESLint flat config for Cypress + TypeScript (ESLint v9)
// Uses @eslint/js recommended, typescript-eslint recommended, and Cypress plugin for test files.

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import cypress from "eslint-plugin-cypress";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Global ignores
  {
    ignores: [
      "node_modules",
      "dist",
      "coverage",
      "reports",
      "**/.cache",
      "**/.history",
      "cypress/screenshots",
      "cypress/videos"
    ]
  },

  // Base JS rules
  js.configs.recommended,

  // TypeScript support (parser + plugin via typescript-eslint all-in-one)
  ...tseslint.configs.recommended,

  // General language options
  {
    files: ["**/*.{js,cjs,mjs,ts}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    }
  },

  // Stricter base rules for JS/TS (aligned with old-config favorites)
  {
    files: ["**/*.{js,cjs,mjs,ts}", "cypress.config.ts"],
    rules: {
      // Keep only non-controversial safety/logic rules from favorites; leave stylistic concerns to Prettier
      "object-curly-spacing": ["error", "always"],
      "curly": ["error", "all"],
      "eqeqeq": ["error", "always", { "null": "ignore" }],
      "no-var": "error",
      "prefer-const": ["warn", { destructuring: "all" }],
      "no-console": "error",
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "guard-for-in": "error",
      "no-new": "error",
      "no-shadow": "error",
      "no-magic-numbers": "error",
      "no-class-assign": "error",
      "no-labels": "error",
      "no-alert": "error",
      "no-eval": "error",
      "no-empty": "error",
      "no-undef-init": "error",
      "no-fallthrough": "error",
      "no-throw-literal": "error",
      "no-unused-expressions": "error",
      "one-var-declaration-per-line": "error",
      "switch-colon-spacing": "error",
      "consistent-return": "error",
      "new-parens": "error",
      "object-shorthand": "error",
      "no-whitespace-before-property": "error",
      "nonblock-statement-body-position": "error",
      "radix": "warn"
    }
  },

  // TypeScript‑specific strictness
  {
    files: ["**/*.ts", "cypress.config.ts"],
    languageOptions: {
      parserOptions: {
        // Enable type-aware rules; allow default project so files outside a tsconfig (e.g., cypress.config.ts) still work
        projectService: {
          allowDefaultProject: [
            "cypress.config.ts"
          ]
        },
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      // Require explicit accessibility on class members (methods, properties, accessors)
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
          accessibility: "explicit",
          overrides: {
            // do not force "public" on constructors
            constructors: "no-public"
          }
        }
      ],
      // Prefer marking fields as readonly when they are not reassigned after construction
      "@typescript-eslint/prefer-readonly": "error",
      // TS-specific preferences from old-config
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-shadow": "error",
      // Helpful, common TS rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      // Disable core duplicate for TS files to avoid conflicts
      "no-shadow": "off",
      // Interfaces must start with an "I" and use PascalCase, e.g., IMyService
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
          prefix: ["I"]
        }
      ]
    }
  },

  // Cypress-specific rules and globals (keep global strictness; only add Cypress plugin rules)
  {
    files: ["cypress/**/*.{js,ts}"],
    plugins: { cypress },
    languageOptions: {
      globals: {
        // Mocha globals commonly used in Cypress tests
        describe: "readonly",
        it: "readonly",
        context: "readonly",
        before: "readonly",
        after: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        // Cypress globals
        cy: "readonly",
        Cypress: "readonly",
        expect: "readonly"
      }
    },
    rules: {
      // Keep Cypress best-practice rules, do not relax base strictness
      "cypress/no-assigning-return-values": "error",
      "cypress/no-unnecessary-waiting": "warn",
      "cypress/assertion-before-screenshot": "warn",
      "cypress/no-async-tests": "error",
      "cypress/no-force": "warn",
      "cypress/no-pause": "warn"
    }
  }
];
