/// <reference types="cypress" />

it('page - resources interactions', () => {
  cy.visit('/resources')

  cy.get('[data-test-id=resources-card').should('have.length', 6)
})
