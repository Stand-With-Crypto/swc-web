/// <reference types="cypress" />

it('donation card redirects to donation page', () => {
  cy.visit('/')

  cy.contains('Donate to Stand With Crypto').click()
  cy.url().should('include', '/donate')
  cy.get('h1').contains('Protect the future of crypto')
})
