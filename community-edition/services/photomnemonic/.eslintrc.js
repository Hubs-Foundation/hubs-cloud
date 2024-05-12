module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true
    },
    parserOptions: {
        "ecmaVersion": 2017
    },
    globals: { process: true },
    plugins: ["prettier"],
    rules: {
      "prettier/prettier": "error",
      "prefer-const": "error",
      "no-use-before-define": "error",
      "no-var": "error",
      "no-throw-literal": "error",
      "no-console": "off"
    },
    extends: ["prettier", "eslint:recommended"]
};
