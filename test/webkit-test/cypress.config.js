const { defineConfig } = require("cypress");

module.exports = defineConfig({
  experimentalWebKitSupport: true,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});

require('@smartbear/visualtest-cypress')(module)