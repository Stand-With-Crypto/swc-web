/// <reference types="cypress" />

describe('page - homepage interactions', () => {
  beforeEach(() => {
    cy.seedDb().then(() => {
      cy.visit('/')
      cy.queryDb('SELECT * FROM user').then((result: any) => {
        expect(result.length, 'users to exist in database').to.greaterThan(0)
      })
      cy.clearAllCookies()
      cy.clearAllLocalStorage()
    })
  })

  it('checking for top donor existence', () => {
    cy.visit('/')

    // verify the donations tab shows top donors
    cy.contains('Top donations').click()
    cy.get('img[alt="position 1 medal"]').should('be.visible')
  })
})
