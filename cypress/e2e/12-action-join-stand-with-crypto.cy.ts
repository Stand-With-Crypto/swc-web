/// <reference types="cypress" />

describe('action - join stand with crypto', () => {
  // Temporarily skipping this test because we need to update a Thirdweb API key configuration
  // and the person responsible for this is OOO
  it.skip('should join stand with crypto, ask for profile update and then logout', () => {
    cy.visit('/')

    cy.get('button').contains('Join Stand With Crypto').click()

    cy.waitForLogin()

    cy.waitForProfileCreation()

    cy.contains('You joined Stand With Crypto!').should('be.visible')
    cy.get('[role="dialog"]').find('button').contains('Close').click({ force: true })

    // asserts that join with crypto is done and not clickable
    cy.contains('Join Stand With Crypto').should('exist').should('not.be.enabled')

    cy.waitForLogout()

    // asserts that join with crypto is clickable again after logout
    cy.contains('Join Stand With Crypto').should('exist').should('be.enabled')
  })
})
