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
  trigger.click()
  // wait for search to be fully ready
  cy.wait(1000)
    .get('[cmdk-input]')
    .then(input => {
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

export {}

declare global {
  namespace Cypress {
    interface Chainable {
      selectFromComboBox(config: {
        trigger: Chainable<JQuery<Node>>
        searchText: string
      }): Chainable<void>
      //   drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      //   dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      //   visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
    }
  }
}
