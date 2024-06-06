/// <reference types="cypress" />

import { mockRandomUser, mockWallet } from 'cypress/fixture/mocks'

describe('action - mint your supporter NFT', () => {
  it('should go through signing in and nft minting', () => {
    cy.visit('/')

    cy.contains('Mint your Supporter NFT').click()

    cy.get('[role="dialog"]')

    cy.get('button[data-testid="signin-button"]').click()

    cy.get('button[data-test="continue-as-guest-button"]').click()

    cy.intercept('/api/auth/login').as('authLogin')

    cy.get('input[data-test="new-password"][type="password"]')

      .type(mockWallet.password)
    cy.get('input[data-test="confirm-password"][type="password"]')

      .type(mockWallet.password)

    cy.contains('Create new wallet').click()

    cy.wait('@authLogin')

    // wait for page blink
    cy.wait(1000)

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

    cy.get('input[placeholder="Your email"], input[placeholder="Email"]')
      .clear()
      .type(mockRandomUser.email)

    cy.get('input[data-testid="phone-number-input"]').clear().type(mockRandomUser.phoneNumber)

    cy.get('button[type="submit"]')
      .contains(/Next|Create account/)
      .scrollIntoView()
      .click()

    cy.contains('Submit').should('be.visible').click()

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
