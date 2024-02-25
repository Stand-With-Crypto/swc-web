/// <reference types="cypress" />

it('page - homepage interactions', () => {
  cy.visit('/')

  // verify the donations tab shows top donors
  cy.contains('Top donations').click()
  cy.get('img[alt="position 1 medal"]').should('be.visible')
})
