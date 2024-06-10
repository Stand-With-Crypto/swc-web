/// <reference types="cypress" />

describe('action - join stand with crypto', () => {
  it('should join stand with crypto', () => {
    cy.visit('/')

    cy.contains('Join Stand With Crypto').click()

    cy.waitForLogin()

    cy.waitForProfileCreation()

    cy.waitForLogout()

    // login again and assert that no profile is asked to be updated
    cy.contains('Join Stand With Crypto').click()

    cy.waitForLogin()

    // click next to update profile and submit
    cy.get('button[type="submit"]').contains('Next').click()
    cy.contains('Submit').should('be.visible').click()

    // assets that join with crypto is done and not clickable
    cy.contains('Join Stand With Crypto')
      .should('exist')
      .should('be.visible')
      .should('not.be.enabled')
  })
})
