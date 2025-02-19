/// <reference types="cypress" />

import { mockRandomUser } from 'cypress/mocks'

describe('action - mint your supporter NFT', () => {
  it.skip('should go through signing in and nft minting', () => {
    cy.visit('/')

    cy.contains('Mint your Supporter NFT').click()

    cy.get('[role="dialog"]')

    cy.waitForLogin(cy.get('button[data-testid="signin-button"]'))

    cy.contains(/Finish your profile|Create an account. Get an NFT./g).should('be.visible')

    cy.typeIntoInput({
      selector: 'input[placeholder="First name"',
      text: mockRandomUser.firstName,
    })

    cy.typeIntoInput({
      selector: 'input[placeholder="Last name"',
      text: mockRandomUser.lastName,
    })

    cy.selectFromComboBox({
      trigger: cy.get('input[placeholder="Street address"], input[placeholder="Address"]'),
      searchText: mockRandomUser.address,
      typingRequired: true,
    })

    cy.get('input[placeholder="Your email"], input[placeholder="Email"]').as('@emailInput').clear()
    cy.get('@emailInput').type(mockRandomUser.email)

    cy.get('input[data-testid="phone-number-input"]').as('@phoneInput').clear()
    cy.get('@phoneInput').type(mockRandomUser.phoneNumber)

    cy.get('button[type="submit"]')
      .contains(/Next|Create account/)
      .scrollIntoView()
    cy.get('button[type="submit"]').click()

    cy.contains('You joined Stand With Crypto!').should('be.visible')
    cy.get('[role="dialog"]').eq(1).find('button').contains('Close').click()

    cy.contains('Continue').should('be.visible').click()

    cy.contains('Mock the minting transaction').should('be.visible').click()

    cy.contains('Mint now - Mocked').should('be.visible').click()

    cy.contains('Transaction complete').should('be.visible')

    cy.queryDb(
      'SELECT * FROM user_action WHERE action_type = "OPT_IN" AND nft_mint_id is not NULL',
    ).then((result: any) => {
      expect(result.length, 'user_action to exist in database').to.equal(1)
    })
  })
})
