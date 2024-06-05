/// <reference types="cypress" />

import { mockRandomUser, mockWallet } from 'cypress/fixture/mocks'

it('action - mint your supporter NFT', () => {
  cy.visit('/')

  cy.contains('Mint your Supporter NFT').click()

  cy.get('[role="dialog"]')

  cy.get('button[data-testid="signin-button"]').click()

  cy.get('button[data-test="continue-as-guest-button"]').click()

  // intercept the api /api/auth/login
  cy.intercept('/api/auth/login').as('authLogin')

  // type random password
  cy.get('input[data-test="new-password"][type="password"]')

    .type(mockWallet.password)
  cy.get('input[data-test="confirm-password"][type="password"]')

    .type(mockWallet.password)

  // click create new wallet
  cy.contains('Create new wallet').click()

  // wait for api /api/auth/login
  cy.wait('@authLogin')

  // wait for page blink
  cy.wait(1000)

  // Check wether there is Finish your profile or Create an account. Get an NFT.
  cy.contains(/Finish your profile|Create an account. Get an NFT./g).should('be.visible')

  // type first name
  cy.get('input[placeholder="First name"').type(mockRandomUser.firstName)

  // type last name
  cy.get('input[placeholder="Last name"').type(mockRandomUser.lastName)

  // type address
  cy.selectFromComboBox({
    trigger: cy.get('input[placeholder="Street address"], input[placeholder="Address"]'),
    searchText: mockRandomUser.address,
  })

  // type email
  cy.get('input[placeholder="Your email"], input[placeholder="Email"]')
    .clear()
    .type(mockRandomUser.email)

  // type phone number
  cy.get('input[data-testid="phone-number-input"]').clear().type(mockRandomUser.phoneNumber)

  cy.get('button[type="submit"]')
    .contains(/Next|Create account/)
    .click({ force: true })

  cy.contains('Submit').should('be.visible').click()

  cy.contains('Continue').should('be.visible').click()

  cy.contains('Mock the minting transaction').should('be.visible').click()

  cy.contains('Mint now - Mocked').should('be.visible').click()

  cy.contains('Transaction complete').should('be.visible')

  // validate database
  cy.queryDb(
    'SELECT * FROM user_action WHERE action_type = "OPT_IN" AND nft_mint_id is not NULL',
  ).then((result: any) => {
    expect(result.length, 'user_action to exist in database').to.equal(1)
  })
  cy.clearDb()
})
