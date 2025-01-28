/// <reference types="cypress" />

describe('action - join stand with crypto', () => {
  it('should join stand with crypto, ask for profile update and then logout', () => {
    cy.visit('/')

    cy.get('button').contains('Join Stand With Crypto').click()

    cy.waitForLogin()

    cy.waitForProfileCreation()

    cy.contains('You joined Stand With Crypto!').should('be.visible')
    cy.get('[role="dialog"]').find('button').contains('Close').click({ force: true })

    // asserts that join with crypto is done and not clickable

    cy.get('button[data-testid="e2e-test-login"]').should('not.exist')

    cy.waitForLogout()

    // asserts that join with crypto is clickable again after logout
    // we can not use be.enabled here because the element that has the text is not the button
    cy.get('button').contains('Join Stand With Crypto').click()
    cy.assertLoginModalOpened()
  })
})
