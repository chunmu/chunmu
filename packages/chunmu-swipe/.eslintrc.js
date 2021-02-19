module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended'],
  plugins: ['@typescript-eslint'],
  env: {
    browser: true,
    node: true,
    jest: true,
    es2020: true
  },
  rules: {
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
}