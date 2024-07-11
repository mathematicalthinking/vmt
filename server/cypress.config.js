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
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
