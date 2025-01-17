import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginNext from "eslint-plugin-next";

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
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
  pluginNext.configs.recommended, // Configuración específica para Next.js
];

export default eslintConfig;
