/// <reference types="cypress" />

describe('action - join stand with crypto', () => {
  it('should join stand with crypto, logout and ask for profile update once', () => {
    cy.visit('/')

    cy.get('button').contains('Join Stand With Crypto').click()

    cy.waitForLogin()

    cy.waitForProfileCreation()

    cy.contains('You joined Stand With Crypto!').should('be.visible')
    cy.get('[role="dialog"]').find('button').contains('Close').click({ force: true })

    cy.waitForLogout()

    // login again and assert that no profile is asked to be updated
    cy.contains('Join Stand With Crypto').click()

    cy.waitForLogin()
    // click next to update profile and submit
    cy.get('button[type="submit"]').contains('Next').click()
    cy.contains('Submit').should('be.visible').click()

    // wait for content to show up
    cy.wait(500)

    // asserts that join with crypto is done and not clickable
    cy.contains('Join Stand With Crypto').should('exist').should('not.be.enabled')
  })
})
