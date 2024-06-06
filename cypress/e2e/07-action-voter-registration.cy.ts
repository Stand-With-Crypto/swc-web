/// <reference types="cypress" />

import { mockRandomUser, mockWallet } from 'cypress/fixture/mocks'

describe('action - voter registration without signin', () => {
  it('action - voter registration - Navigate back and forth', () => {
    cy.visit('/')

    cy.contains('Check your voter registration and get a free NFT').click()
    cy.get('[role="dialog"]')

    cy.get('button[type="button"]').contains('Yes').click()

    cy.contains("Claim “I'm a Voter” NFT")

    // Go back to initial screen
    cy.get('[data-testid="action-form-back-button"]').click()

    cy.get('button[type="button"]').contains('No').click()

    // Go back to initial screen
    cy.get('[data-testid="action-form-back-button"]').click()

    cy.get('button[type="button"]')
      .contains(/not sure/)
      .click()

    // Go back to initial screen
    cy.get('[data-testid="action-form-back-button"]').click()

    cy.get('button[type="button"]').contains('Yes').should('be.visible')
    cy.get('button[type="button"]').contains('No').should('be.visible')
    cy.get('button[type="button"]')
      .contains(/not sure/)
      .should('be.visible')
  })

  it('action - voter registration - No flow', () => {
    cy.visit('/')

    cy.contains('Check your voter registration and get a free NFT').click()
    cy.get('[role="dialog"]')

    cy.get('button[type="button"]').contains('No').click()

    cy.selectFromRadixComboBox({
      triggerSelector: '[data-testid="state-filter-trigger"]',
      state: 'California',
    })

    cy.get('a[data-testid="step2-cta-anchor"]').trigger('click', { force: true })

    cy.get('button[type="button"]').contains('Claim NFT').click()

    cy.contains("Claim “I'm a Voter” NFT")

    cy.get('button[type="button"]').contains('Claim NFT').click()

    // waiting for Inngest to consume job
    cy.contains('Nice work! You earned a new NFT.')

    // validate database
    cy.queryDb('SELECT * FROM user_action WHERE action_type="VOTER_REGISTRATION"').then(
      (result: any) => {
        expect(result.length, 'user_action to exist in database').to.equal(1)
      },
    )
  })
})

describe.only('action - voter registration with signin', () => {
  it('action - voter registration - Yes flow signing in afterwards', () => {
    cy.visit('/')

    cy.contains('Check your voter registration and get a free NFT').click()
    cy.get('[role="dialog"]')

    cy.get('button[type="button"]').contains('Yes').click()

    // Claim NFT step
    cy.contains("Claim “I'm a Voter” NFT")

    // intercept the api /api/auth/login
    cy.intercept('/api/auth/login').as('authLogin')
    // intercept the api /api/identified-user/claimed-opt-in-nft
    cy.intercept('/api/identified-user/claimed-opt-in-nft').as('hasOptInNft')

    cy.get('button[type="button"]').contains('Claim NFT').click()

    // waiting for Inngest to consume job
    cy.contains('Nice work! You earned a new NFT.')

    // validate database
    cy.queryDb('SELECT * FROM user_action WHERE action_type="VOTER_REGISTRATION"').then(
      (result: any) => {
        expect(result.length, 'user_action to exist in database').to.equal(1)
      },
    )

    cy.get('button[type="button"]').contains('Join To Claim NFT').click()

    cy.get('button[data-test="continue-as-guest-button"]').click()

    // type random password
    cy.get('input[data-test="new-password"][type="password"]').type(mockWallet.password)
    cy.get('input[data-test="confirm-password"][type="password"]').type(mockWallet.password)

    // click create new wallet
    cy.contains('Create new wallet').click()

    // wait for api /api/auth/login and /api/identified-user/performed-user-action-types
    cy.wait('@authLogin')

    cy.contains(/Finish my profile/g).click()

    cy.wait('@hasOptInNft')

    // wait for page blink
    cy.wait(1000)

    // Check wether there is Finish your profile or Create an account. Get an NFT.
    cy.contains(/Finish your profile|Create an account. Get an NFT./g).should('be.visible')

    // type first name
    cy.get('input[placeholder="First name"').should('exist').type(mockRandomUser.firstName)

    // type last name
    cy.get('input[placeholder="Last name"').should('exist').type(mockRandomUser.lastName)

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
      .scrollIntoView()
      .click({ force: true })

    cy.contains('Submit').should('be.visible').click()

    cy.contains(/You've completed [0-9] out of [0-9] actions. Keep going!/g).should('be.visible')

    cy.queryDb(
      'SELECT * FROM user_action WHERE action_type = "OPT_IN" AND nft_mint_id is not NULL',
    ).then((result: any) => {
      expect(result.length, 'user_action to exist in database').to.equal(1)
    })
  })
})
