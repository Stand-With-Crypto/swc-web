/// <reference types="cypress" />

it('page - bills interactions', () => {
  cy.visit('/bills')

  cy.get('h1').contains('Crypto Bills')
  cy.get('[data-testid=bill-card]').first().as('billCard')
  cy.get('@billCard').should('be.visible').click()

  cy.location('pathname').should('include', '/bills/')
  cy.contains('Analysis').should('be.visible')

  cy.contains('Votes').scrollIntoView().should('be.visible')
  cy.contains('Sponsor').should('be.visible')
  cy.contains('Cosponsors').should('be.visible')
  cy.contains('Voted For').should('be.visible')
  cy.contains('Voted Against').should('be.visible')
})
