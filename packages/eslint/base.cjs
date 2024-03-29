module.exports = {
  env: {
    node: true,
  },
  parser: "@typescript-eslint/parser",
  extends: [
    "turbo",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:tailwindcss/recommended",
  ],
  plugins: ["tailwindcss", "@typescript-eslint"],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  rules: {
    "@typescript-eslint/no-non-null-assertion": "off",
    "no-var": "off",
    "prefer-const": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "tailwindcss/no-custom-classname": "off",
  },
  ignorePatterns: [
    "**/.eslintrc.cjs",
    "**/*.config.js",
    "**/*.config.cjs",
    ".next",
    "dist",
    "pnpm-lock.yaml",
    "**/build",
    "**/public/build",
    "**/playwright-report",
  ],
};