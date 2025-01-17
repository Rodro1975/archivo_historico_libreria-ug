import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: process.cwd(), // Cambia a tu directorio base si es necesario
});

const eslintConfig = {
  ...compat.extends("next/core-web-vitals"),
  rules: {
    // Aquí puedes agregar reglas personalizadas si es necesario
  },
};

export default eslintConfig;
