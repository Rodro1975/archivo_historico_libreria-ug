import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Desactivar la advertencia sobre el uso de <img>:
      "@next/next/no-img-element": "off",
    },
    // Ignorar los archivos generados en la carpeta .next y node_modules
    ignores: ["**/.next/**/*", "**/node_modules/**/*"], // Asegúrate de usar patrones glob
  },
];

export default eslintConfig;






