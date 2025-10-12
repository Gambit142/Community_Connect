import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    env: {
      apiUrl: 'http://localhost:5001/api', // Use test server
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
