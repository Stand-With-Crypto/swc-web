// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// ignores ResizeObserver loop error in cypress tests\
// https://github.com/cypress-io/cypress/issues/8418
Cypress.on('uncaught:exception', err => {
  if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    console.log('ResizeObserver loop error ignored')
    return false
  }

  // Let Cypress fail the test for any other errors
  return true
})

beforeEach(() => {
  cy.clearDb()
})
