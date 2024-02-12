import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: process.env.CYPRESS_PROJECT_ID,
  // iPhone 12 Pro
  viewportWidth: 390,
  viewportHeight: 844,
  defaultCommandTimeout: 10000,
  e2e: {
    baseUrl: 'http://localhost:3000',
  },
})
