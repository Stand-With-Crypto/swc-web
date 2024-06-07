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
      cy.contains('Nice work!')

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
      cy.get('[role="dialog"]').as('dialog')

      cy.get('button[type="button"]').contains('Yes').click()

      cy.contains("Claim “I'm a Voter” NFT")

      cy.intercept('/api/identified-user/claimed-opt-in-nft').as('hasOptInNft')

      cy.get('button[type="button"]').contains('Claim NFT').click()

      // waiting for Inngest to consume job
      cy.contains('Nice work!')

      cy.queryDb('SELECT * FROM user_action WHERE action_type="VOTER_REGISTRATION"').then(
        (result: any) => {
          expect(result.length, 'user_action to exist in database').to.equal(1)
        },
      )

      cy.waitForLogin({
        trigger: cy.get('@dialog').find('button[type="button"]').contains('Join Stand With Crypto'),
      })

      cy.get('@dialog')
        .find('input[placeholder="Phone number"]')
        .should('be.visible')
        .type(mockRandomUser.phoneNumber)

      cy.get('@dialog').find("button[type='submit']").contains('Get updates').click()

      cy.contains('You registered to vote!').should('be.visible')

      cy.queryDb('SELECT * FROM user_action WHERE action_type = "OPT_IN"').then((result: any) => {
        expect(result.length, 'user_action to exist in database').to.equal(1)
      })
    })
  })
})
