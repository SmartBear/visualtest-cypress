const { defineConfig } = require("cypress");

module.exports = defineConfig({
  // viewportWidth: 1920,
  // viewportHeight: 1080,
  video: false,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});

require('@smartbear/visualtest-cypress')(module)