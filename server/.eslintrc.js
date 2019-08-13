module.exports = {
  env: { node: true },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  globals: { isNaN: true },
  rules: {
    'no-use-before-define': 0,
    'no-param-reassign': 0,
    'no-underscore-dangle': 0,
    'no-throw-literal': 0,
  },
};
