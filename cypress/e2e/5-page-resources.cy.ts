/// <reference types="cypress" />

it('page - resources interactions', () => {
  cy.visit('/resources')

  cy.get('[data-test-id=event-card').should('have.length', 4)
  cy.get('[data-test-id=policy-card').should('have.length', 2)
})
