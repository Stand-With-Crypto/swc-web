/// <reference types="cypress" />

import { mockRandomUser, mockWallet } from 'cypress/fixture/mocks'

it('action - mint your supporter NFT', () => {
  cy.visit('/')

  cy.contains('Mint your Supporter NFT').click()

  cy.get('[role="dialog"]')

  cy.get('button[data-testid="signin-button"]').should('be.visible').click()

  cy.get('button[data-test="continue-as-guest-button"]').should('be.visible').click()

  // intercept the api /api/auth/login
  cy.intercept('/api/auth/login').as('authLogin')

  // type random password
  cy.get('input[data-test="new-password"][type="password"]')
    .should('be.visible')
    .type(mockWallet.password)
  cy.get('input[data-test="confirm-password"][type="password"]')
    .should('be.visible')
    .type(mockWallet.password)

  // click create new wallet
  cy.contains('Create new wallet').click()

  // wait for api /api/auth/login
  cy.wait('@authLogin')

  // wait for page blink
  cy.wait(1000)

  // wait until there's Finish your profile on the screen
  cy.contains('Finish your profile').should('be.visible')

  // type first name
  cy.get('input[placeholder="First name"').should('be.visible').type(mockRandomUser.firstName)

  // type last name
  cy.get('input[placeholder="Last name"').should('be.visible').type(mockRandomUser.lastName)

  // type address
  cy.selectFromComboBox({
    trigger: cy.get('input[placeholder="Street address"]'),
    searchText: mockRandomUser.address,
  })

  // type email
  const emailAddressInput = cy.get('input[placeholder="Your email"')

  emailAddressInput.should('be.visible')
  emailAddressInput.clear()
  emailAddressInput.type(mockRandomUser.email)

  cy.contains('Next').click()

  cy.contains('Submit').click()

  cy.contains('Continue').click()

  // cy.get('button[role="checkbox"][data-state="unchecked"]').click()
  cy.contains('Mock the minting transaction').click()

  cy.contains('Mint now - Mocked').click()

  cy.contains('Transaction complete').should('be.visible')

  // validate database
  cy.queryDb(
    'SELECT * FROM user_action WHERE action_type = "OPT_IN" AND nft_mint_id is not NULL',
  ).then((result: any) => {
    expect(result.length, 'user_action to exist in database').to.equal(1)
  })
  cy.clearDb()
})
