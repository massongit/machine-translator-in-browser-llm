// https://github.com/super-linter/super-linter/blob/v9.0.0/TEMPLATES/stylelint.config.mjs
import postcssScss from "postcss-scss";

export default {
  extends: ["stylelint-config-standard", "stylelint-config-tailwindcss"],
  overrides: [
    {
      files: ["*.scss", "**/*.scss"],
      extends: ["stylelint-config-recommended-scss"],
      customSyntax: postcssScss,
    },
  ],
};
