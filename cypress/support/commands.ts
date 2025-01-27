/// <reference types="cypress" />

import { mockRandomUser } from 'cypress/fixture/mocks'

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

Cypress.Commands.add('selectFromComboBox', ({ trigger, searchText, typingRequired = false }) => {
  // Wait for the DOM to be ready
  cy.wait(1000)

  trigger.click()

  // Wait for the combo box to be fully ready
  cy.wait(1000)

  if (typingRequired) {
    // Handle typing case
    cy.get('[cmdk-input]').then(input => {
      // Clear input and wait for results to clear before typing and selecting the new option
      if (input.val()) {
        return cy.get('[cmdk-input]').clear().wait(500).type(searchText)
      }
      return cy.get('[cmdk-input]').type(searchText)
    })

    // Wait for items to appear
    cy.get('[cmdk-item]')

    // Select the first item
    cy.get('[cmdk-group-items]')
      .children()
      .first()
      .click()
      .then(el => {
        // Sometimes we need a double click to select the item
        el?.trigger('click')
      })

    return
  }

  cy.get('[role="option"]').contains('div', searchText).as('selectOption')
  cy.get('@selectOption').should('exist').click({ force: true })
})

Cypress.Commands.add('queryDb', (query: string) => {
  return cy.task('queryDb', query)
})

Cypress.Commands.add('executeDb', (query: string) => {
  return cy.task('executeDb', query)
})

Cypress.Commands.add('clearDb', () => {
  const tableNames = [
    'address',
    'authentication_nonce',
    'nft_mint',
    'user',
    'user_action',
    'user_action_call',
    'user_action_donation',
    'user_action_email',
    'user_action_email_recipient',
    'user_action_opt_in',
    'user_action_voter_registration',
    'user_crypto_address',
    'user_email_address',
    'user_merge_alert',
    'user_merge_event',
    'user_session',
  ]
  tableNames.forEach(tableName => {
    cy.task('executeDb', `DELETE FROM ${tableName}`)
  })
})

Cypress.Commands.add('seedDb', () => {
  cy.exec('SEED_SIZE=SM')
  cy.exec('npm run ts --transpile-only src/bin/seed/seedLocalDb.ts')
})

Cypress.Commands.add('typeIntoInput', ({ selector, text }) => {
  cy.get(selector).should('be.visible').clear().wait(500).type(text)
})

Cypress.Commands.add('assertLoginModalOpened', () => {
  cy.get('button[data-testid="e2e-test-login"]').should('be.visible')
})

Cypress.Commands.add('waitForLogin', trigger => {
  trigger?.click()

  cy.wait(500)

  cy.get('button[data-testid="e2e-test-login"]').click()

  cy.get('Join Stand With Crypto', { timeout: 20000 }).should('not.exist')
})

Cypress.Commands.add('waitForProfileCreation', (customUser = mockRandomUser) => {
  cy.contains(/Finish your profile|Create an account. Get an NFT./g, { timeout: 30000 }).should(
    'be.visible',
  )

  cy.typeIntoInput({
    selector: 'input[placeholder="First name"]',
    text: customUser.firstName,
  })

  cy.typeIntoInput({
    selector: 'input[placeholder="Last name"]',
    text: customUser.lastName,
  })

  cy.selectFromComboBox({
    trigger: cy.get('input[placeholder="Street address"], input[placeholder="Address"]'),
    searchText: customUser.address,
    typingRequired: true,
  })

  cy.get('input[placeholder="Your email"], input[placeholder="Email"]')
    .clear()
    .type(customUser.email)

  cy.get('input[data-testid="phone-number-input"]').clear().type(customUser.phoneNumber)

  cy.get('button[data-testid="opt-in-checkbox"]').click()

  cy.get('button[type="submit"]')
    .contains(/Next|Create account/)
    .scrollIntoView()
    .click()

  cy.wait(500)

  cy.contains('Profile updated')
})

Cypress.Commands.add('waitForLogout', () => {
  cy.get('button[data-testid="drawer-trigger"]').click()

  cy.wait(500)

  cy.get('button[data-testid="login-button"]').filter(':visible').click()

  cy.contains('Log out').click()
})

export {}

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * This command is used to select an option from a combo box.
       * The parameter typingRequired is used to determine if the user needs to type in the search input before selecting an option
       * @param config - An object with trigger, searchText, and typingRequired
       * @example cy.selectFromComboBox({ trigger: cy.get('input[data-test="search-input"]'), searchText: 'test', typingRequired: true })
       */
      selectFromComboBox(config: {
        trigger: Cypress.Chainable<JQuery<HTMLElement>>
        searchText: string
        typingRequired?: boolean
      }): Chainable<void>
      queryDb(query: string): Chainable<any>
      executeDb(query: string): Chainable<any>
      clearDb(): Chainable<void>
      seedDb(): Chainable<void>
      /**
       * This command is used to type into an input field
       * @param config - An object with selector and text to type into the input
       * @example cy.typeIntoInput({ selector: 'input[data-test="email-input"]', text: 'test'})
       */
      typeIntoInput(config: { selector: string; text: string }): Chainable<void>
      /**
       * This command is used to wait for the login page to load and then fill in the login form
       * @param trigger - optional - The trigger to click to open the login form
       * @example cy.waitForLogin({ trigger: cy.get('button[data-test="login-button"]') })
       * @returns void
       */
      waitForLogin(trigger?: Cypress.Chainable<JQuery<HTMLElement>>): Chainable<void>
      waitForLogout(): Chainable<void>
      /**
       * This command is used to wait for the profile creation page to load and then fill in the profile form
       * @param customUser - optional - The custom user to use for profile creation
       */
      waitForProfileCreation(customUser?: typeof mockRandomUser): Chainable<void>

      /**
       * This command is used to assert that the login modal is opened
       */
      assertLoginModalOpened(): Chainable<void>
      //   drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      //   dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      //   visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
    }
  }
}
