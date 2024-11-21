/// <reference types="cypress" />

it('donation card redirects to donation page', () => {
  cy.visit('/')

  cy.contains('Make a donation').click()
  cy.url().should('include', '/donate')
  cy.get('h1').contains('Protect the future of crypto')
})
