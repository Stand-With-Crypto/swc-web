/// <reference types="cypress" />

import { mockRandomUser, mockWallet } from 'cypress/fixture/mocks'

describe('action - voter registration', () => {
  it('action - voter registration - Yes flow', () => {
    cy.visit('/')

    cy.contains('Check your voter registration and get a free NFT').click()
    cy.get('[role="dialog"]')

    cy.contains('Yes').click()

    // Claim NFT step
    cy.contains("Claim “I'm a Voter” NFT")
    cy.contains('Claim NFT').click()

    // waiting for Inngest to consume job
    cy.contains('Nice work! You earned a new NFT.')

    // validate database
    cy.queryDb('SELECT * FROM user_action WHERE action_type="VOTER_REGISTRATION"').then(
      (result: any) => {
        expect(result.length, 'user_action to exist in database').to.equal(1)
      },
    )
  })

  it('action - voter registration - No flow', () => {
    cy.visit('/')

    cy.contains('Check your voter registration and get a free NFT').click()
    cy.get('[role="dialog"]')

    cy.contains('No').click()

    cy.selectFromRadixComboBox({
      triggerSelector: '[data-testid="state-filter-trigger"]',
      state: 'California',
    })

    cy.get('a[data-testid="step2-cta-anchor"]').trigger('click')

    cy.contains('Claim NFT').click()

    cy.contains("Claim “I'm a Voter” NFT")

    cy.contains('Claim NFT').click()

    // waiting for Inngest to consume job
    cy.contains('Nice work! You earned a new NFT.')

    // validate database
    cy.queryDb('SELECT * FROM user_action WHERE action_type="VOTER_REGISTRATION"').then(
      (result: any) => {
        expect(result.length, 'user_action to exist in database').to.equal(1)
      },
    )
  })

  it('action - voter registration - Not sure flow and click back', () => {
    cy.visit('/')

    cy.contains('Check your voter registration and get a free NFT').click()
    cy.get('[role="dialog"]')

    cy.contains(/not sure/g).click()

    cy.contains("Check your registration and get a free “I'm a Voter” NFT").should('be.visible')

    cy.get('[data-testid="action-form-back-button"]').click()

    cy.contains(/not sure/g).click()
  })

  it('action - voter registration - Yes flow signing in afterwards', () => {
    cy.visit('/')

    cy.contains('Check your voter registration and get a free NFT').click()
    cy.get('[role="dialog"]')

    cy.contains('Yes').click()

    // Claim NFT step
    cy.contains("Claim “I'm a Voter” NFT")
    cy.contains('Claim NFT').click()

    // waiting for Inngest to consume job
    cy.contains('Nice work! You earned a new NFT.')

    // validate database
    cy.queryDb('SELECT * FROM user_action WHERE action_type="VOTER_REGISTRATION"').then(
      (result: any) => {
        expect(result.length, 'user_action to exist in database').to.equal(1)
      },
    )

    cy.contains('Join To Claim NFT').click()

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

    cy.contains(/Finish my profile/g).click()

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
