/// <reference types="cypress" />

it('page - bills interactions', () => {
  cy.visit('/bills')

  cy.get('h1').contains('Crypto Bills')
  cy.get('[data-testid=bill-card]').first().as('billCard')
  cy.get('@billCard').should('be.visible').click()

  cy.location('pathname').should('include', '/bills/')
  cy.contains('Analysis').should('be.visible')
  cy.contains('Sponsors').should('be.visible')
  cy.contains('Co-Sponsors').should('be.visible')
  cy.contains('Voted for').should('be.visible')
  cy.contains('Voted against').should('be.visible')
})
