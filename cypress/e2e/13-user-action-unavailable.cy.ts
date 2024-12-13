/// <reference types="cypress" />

describe('disabled user actions for non-US users', () =>
  ['/action/email', '/action/call', '/action/share', '/action/nft-mint'].forEach(action => {
    it(`should show user action unavailable message for ${action}`, () => {
      cy.visit(action)
      cy.setCookie('USER_COUNTRY_CODE', 'BR')
      cy.contains('Action unavailable').should('be.visible')
    })
  }))

it.skip('should not create user action for non-US users', () => {
  cy.setCookie('USER_COUNTRY_CODE', 'US')
  cy.visit('/')
  cy.contains('Email your congressperson').click()
  cy.get('[role="dialog"]')

  cy.get('input[placeholder="Your first name"]').type('John')
  cy.get('input[placeholder="Your last name"]').type('Doe')
  cy.get('input[placeholder="Your email"]').type('johndoe@gmail.com')
  cy.selectFromComboBox({
    trigger: cy.get('input[placeholder="Your full address"]'),
    searchText: '350 Fifth Avenue New York, NY 10118',
    typingRequired: true,
  })
  cy.get('[data-test-id="dtsi-person-associated-with-address"]')
  cy.get('textarea').type('test message')

  cy.setCookie('USER_COUNTRY_CODE', 'BR')
  cy.wait(100)

  cy.get('button[type="submit"]').click()

  cy.queryDb('SELECT * FROM user_action_email WHERE sender_email="johndoe@gmail.com"').then(
    (result: any) => {
      expect(result.length, 'user_action_email to exist in database').to.equal(0)
    },
  )
})
