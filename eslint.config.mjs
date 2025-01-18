import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginNext from "eslint-plugin-next";

/** @type {import('eslint').Linter.FlatConfig[]} */
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals"],
  }),
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Agrega tus reglas personalizadas aquí, si es necesario
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: ["next"],
    rules: {
      // Puedes agregar reglas personalizadas para Next.js aquí
    },
  },
  pluginNext.configs.recommended, // Asegúrate de incluir esta línea
];

export default eslintConfig;
