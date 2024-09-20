/// <reference types="cypress" />

describe('action - voter registration', () => {
  describe('not signed in voter registration flows', () => {
    it.skip('should navigate back and forth between the asked options yes, no and not sure', () => {
      cy.visit('/')

      cy.contains('Check your voter registration').click()
      cy.get('[role="dialog"]')

      cy.get('button[type="button"]').contains('Yes').click()

      cy.contains('Thanks for being registered!')

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

    it.skip('should go though the flow when the user is not registered to vote', () => {
      cy.visit('/')

      cy.contains('Check your voter registration').click()
      cy.get('[role="dialog"]')

      cy.get('button[type="button"]').contains('No').click()

      cy.selectFromComboBox({
        trigger: cy.get('[data-testid="state-filter-trigger"]'),
        searchText: 'California',
      })

      cy.get('button')
        .contains(/register to vote/i)
        .trigger('click', { force: true })

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
    it.skip('should go through the flow when the user is registered to vote and sign in afterwards', () => {
      cy.visit('/')

      cy.get('button').contains('Join Stand With Crypto').click()

      cy.waitForLogin()

      cy.waitForProfileCreation()

      cy.contains('You joined Stand With Crypto!').should('be.visible')
      cy.get('[role="dialog"]').find('button').contains('Close').click({ force: true })

      cy.contains('Check your voter registration').click()
      cy.get('[role="dialog"]').as('dialog')

      cy.get('button[type="button"]').contains('Yes').click()

      cy.selectFromComboBox({
        trigger: cy.get('[data-testid="state-filter-trigger"]'),
        searchText: 'California',
      })

      cy.get('button')
        .contains(/check my registration status/i)
        .trigger('click', { force: true })

      // waiting for Inngest to consume job
      cy.contains('You registered to vote!').should('be.visible')

      cy.queryDb('SELECT * FROM user_action WHERE action_type="VOTER_REGISTRATION"').then(
        (result: any) => {
          expect(result.length, 'user_action to exist in database').to.equal(1)
        },
      )
    })
  })
})
