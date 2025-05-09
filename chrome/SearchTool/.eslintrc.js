module.exports = {
  root: true,
  globals: {
    chrome: true,
  },
  env: {
    node: true,
  },
  extends: ["plugin:vue/vue3-essential", "@vue/prettier"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
  },
  parserOptions: {
    parser: "@babel/eslint-parser",
  },
};
