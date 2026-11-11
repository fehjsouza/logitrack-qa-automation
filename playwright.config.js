
const { defineConfig } = require('@playwright/test');
const { defineBddConfig } = require('playwright-bdd');

const bddTestDir = defineBddConfig({
  features: 'features/*.feature',
  steps: ['steps/**/*.js'],
});

module.exports = defineConfig({
  reporter: [
    ['list'],
    ['html', {
      outputFolder: 'evidencias/relatorio-html',
      open: 'never'
    }]
  ],

  workers: 1,


projects: [
  {
    name: 'BDD',
    testDir: bddTestDir,
  },
  {
    name: 'API',
    testDir: './tests/api',
  },
  {
    name: 'WEB',
    testDir: './tests/web',
  }
],

  use: {
    baseURL: 'http://127.0.0.1:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },
});
