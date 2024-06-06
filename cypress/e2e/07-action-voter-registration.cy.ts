/// <reference types="cypress" />

import { mockRandomUser, mockWallet } from 'cypress/fixture/mocks'

describe('action - voter registration', () => {
  describe('not signed in voter registration flows', () => {
    it('should navigate back and forth between the asked options yes, no and not sure', () => {
      cy.visit('/')

      cy.contains('Check your voter registration and get a free NFT').click()
      cy.get('[role="dialog"]')

      cy.get('button[type="button"]').contains('Yes').click()

      cy.contains("Claim “I'm a Voter” NFT")

      cy.get('[data-testid="action-form-back-button"]').click()

      cy.get('button[type="button"]').contains('No').click()

      cy.get('[data-testid="action-form-back-button"]').click()

      cy.get('button[type="button"]')
        .contains(/not sure/)
        .click()

      cy.get('[data-testid="action-form-back-button"]').click()

      cy.get('button[type="button"]').contains('Yes').should('be.visible')
      cy.get('button[type="button"]').contains('No').should('be.visible')
      cy.get('button[type="button"]')
        .contains(/not sure/)
        .should('be.visible')
    })

    it('should go though the flow when the user is not registered to vote', () => {
      cy.visit('/')

      cy.contains('Check your voter registration and get a free NFT').click()
      cy.get('[role="dialog"]')

      cy.get('button[type="button"]').contains('No').click()

      cy.selectFromComboBox({
        trigger: cy.get('[data-testid="state-filter-trigger"]'),
        searchText: 'California',
      })

      cy.get('a[data-testid="step2-cta-anchor"]').trigger('click', { force: true })

      cy.get('button[type="button"]').contains('Claim NFT').click()

      cy.contains("Claim “I'm a Voter” NFT")

      cy.get('button[type="button"]').contains('Claim NFT').click()

      // waiting for Inngest to consume job
      cy.contains('Nice work! You earned a new NFT.')

      cy.queryDb('SELECT * FROM user_action WHERE action_type="VOTER_REGISTRATION"').then(
        (result: any) => {
          expect(result.length, 'user_action to exist in database').to.equal(1)
        },
      )
    })
  })

  describe('signed in voter registration flows', () => {
    it('should go through the flow when the user is registered to vote and sign in afterwards', () => {
      cy.visit('/')

      cy.contains('Check your voter registration and get a free NFT').click()
      cy.get('[role="dialog"]')

      cy.get('button[type="button"]').contains('Yes').click()

      cy.contains("Claim “I'm a Voter” NFT")

      cy.intercept('/api/auth/login').as('authLogin')
      cy.intercept('/api/identified-user/claimed-opt-in-nft').as('hasOptInNft')

      cy.get('button[type="button"]').contains('Claim NFT').click()

      // waiting for Inngest to consume job
      cy.contains('Nice work! You earned a new NFT.')

      cy.queryDb('SELECT * FROM user_action WHERE action_type="VOTER_REGISTRATION"').then(
        (result: any) => {
          expect(result.length, 'user_action to exist in database').to.equal(1)
        },
      )

      cy.get('button[type="button"]').contains('Join To Claim NFT').click()

      cy.get('button[data-test="continue-as-guest-button"]').click()

      cy.get('input[data-test="new-password"][type="password"]').type(mockWallet.password)
      cy.get('input[data-test="confirm-password"][type="password"]').type(mockWallet.password)

      cy.contains('Create new wallet').click()

      cy.wait('@authLogin')

      cy.contains(/Finish my profile/g).click()

      cy.wait('@hasOptInNft')

      // wait for page blink
      cy.wait(1000)

      cy.contains(/Finish your profile|Create an account. Get an NFT./g).should('be.visible')

      cy.get('input[placeholder="First name"').should('be.visible').type(mockRandomUser.firstName)

      cy.get('input[placeholder="Last name"').should('be.visible').type(mockRandomUser.lastName)

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
})
