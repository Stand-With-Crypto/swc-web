/// <reference types="cypress" />

describe('page - homepage interactions', () => {
  beforeEach(() => {
    cy.seedDb().then(() => {
      // Manually revalidate the homepage data
      cy.request({
        method: 'GET',
        url: `api/internal/manually-revalidate-path?secret=${Cypress.env('SWC_INTERNAL_ENDPOINTS_SECRET')}&paths=/`,
      })
      // NOTE: `revalidatePath` only invalidates the cache when the path is next visited.
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
    cy.get('[data-testid="community-leaderboard-tabs"]').scrollIntoView()
    cy.get('[data-testid="responsive-tabs-or-select-trigger"]').should('be.visible').click()
    cy.get('[role="option"]').contains('Top donations').should('be.visible').click()

    cy.get('img[alt="position 1 medal"]').should('be.visible')
  })
})
