const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'ccb1ty',
  env: {
    NODE_ENV: 'test',
  },
  e2e: {
    baseUrl: 'http://localhost:3000/',
    defaultCommandTimeout: 9000,
    chromeWebSecurity: false,
    viewportWidth: 1400,
    viewportHeight: 860,
    supportFile: 'cypress/support/index.js',
    specPattern: 'cypress/integration/**/*.js',
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
  },
});
