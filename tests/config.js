import vueEslintParser from "vue-eslint-parser";
import tsParser from "@typescript-eslint/parser";

const config = {
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    parser: vueEslintParser,
    parserOptions: {
      parser: tsParser,
    },
  }
}

export default config;