import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: process.cwd(),
});

const eslintConfig = {
  extends: ["next/core-web-vitals"], // Extensión directa sin usar compat
  rules: {
    // Aquí puedes agregar reglas personalizadas si es necesario
  },
};

export default eslintConfig;
