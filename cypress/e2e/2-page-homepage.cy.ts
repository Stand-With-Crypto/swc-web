/// <reference types="cypress" />

describe('page - homepage interactions', () => {
  beforeEach(() => {
    cy.seedDb().then(() => {
      cy.visit('/')
    })
  })

  it('checking for top donor existence', () => {
    cy.visit('/')

    // verify the donations tab shows top donors
    cy.contains('Top donations').click()
    cy.get('img[alt="position 1 medal"]').should('be.visible')
  })
})
