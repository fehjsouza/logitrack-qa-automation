const { test: base } = require('playwright-bdd');

const test = base.extend({
  scenarioContext: async ({}, use) => {
    await use({});
  },
});

module.exports = { test };