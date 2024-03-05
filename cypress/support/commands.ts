/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

Cypress.Commands.add('selectFromComboBox', ({ trigger, searchText }) => {
  // wait for dom to be ready
  cy.wait(1000)
  trigger.click()
  // wait for combo box to be fully ready
  cy.wait(1000)
  cy.get('[cmdk-input]').then(input => {
    // clear input and wait for results to clear before typing and selecting the new option
    if (input.val()) {
      return cy.get('[cmdk-input]').clear().wait(500).type(searchText)
    }
    return cy.get('[cmdk-input]').type(searchText)
  })
  // wait for items to appear
  cy.get('[cmdk-item]')
  // select the first item
  cy.get('[cmdk-group-items]')
    .children()
    .first()
    .click()
    .then(el => {
      // sometimes we need a double click to select the item
      el?.trigger('click')
    })
})

Cypress.Commands.add('clearDb', () => {
  cy.task('queryDb', 'DELETE FROM address')
  cy.task('queryDb', 'DELETE FROM authentication_nonce')
  cy.task('queryDb', 'DELETE FROM nft_mint')
  cy.task('queryDb', 'DELETE FROM user')
  cy.task('queryDb', 'DELETE FROM user_action')
  cy.task('queryDb', 'DELETE FROM user_action_call')
  cy.task('queryDb', 'DELETE FROM user_action_donation')
  cy.task('queryDb', 'DELETE FROM user_action_email')
  cy.task('queryDb', 'DELETE FROM user_action_email_recipient')
  cy.task('queryDb', 'DELETE FROM user_action_opt_in')
  cy.task('queryDb', 'DELETE FROM user_action_voter_registration')
  cy.task('queryDb', 'DELETE FROM user_crypto_address')
  cy.task('queryDb', 'DELETE FROM user_email_address')
  cy.task('queryDb', 'DELETE FROM user_merge_alert')
  cy.task('queryDb', 'DELETE FROM user_merge_event')
  cy.task('queryDb', 'DELETE FROM user_session')
})

Cypress.Commands.add('seedDb', () => {
  cy.exec('SEED_SIZE=SM').then(result => {
    cy.log('stdout:' + result.stdout)
    cy.log('stderr:' + result.stderr)
  })
  cy.exec('npm run ts --transpile-only src/bin/seed/seedLocalDb.ts').then(result => {
    cy.log('stdout:' + result.stdout)
    cy.log('stderr:' + result.stderr)
  })
})

export {}

declare global {
  namespace Cypress {
    interface Chainable {
      selectFromComboBox(config: {
        trigger: Chainable<JQuery<Node>>
        searchText: string
      }): Chainable<void>
      clearDb(): Chainable<void>
      seedDb(): Chainable<void>

      //   drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      //   dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      //   visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
    }
  }
}
