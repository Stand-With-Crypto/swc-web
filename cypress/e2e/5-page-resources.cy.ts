/// <reference types="cypress" />

it('page - resources interactions', () => {
  cy.visit('/resources')

  cy.get('[data-test-id=event-card').should('have.length', 3)
  cy.get('[data-test-id=policy-card').should('have.length', 2)
  // Test all links
  cy.get("a:not([href*='mailto:'])").each(page => {
    cy.request(page.prop('href'))
  })
})
