/// <reference types="cypress" />

it('action - call your congressperson', () => {
  cy.visit('/')

  // validate CTA button
  cy.contains('div', 'Call your congressperson').as('ctaButton')
  cy.get('@ctaButton').scrollIntoView().should('be.visible')
  cy.get('@ctaButton').click()

  // validate modal
  cy.get('[role="dialog"]').should('be.visible')
  cy.contains('button', 'Continue').should('be.visible').click()

  // validate error messages display
  cy.selectFromComboBox({
    trigger: cy.get('input[placeholder="Your full address"]'),
    searchText: 'berlin germany',
  })
  cy.contains('Please enter a US-based address.').should('be.visible')

  cy.selectFromComboBox({
    trigger: cy.get('input[placeholder="Your full address"]'),
    searchText: 'new york',
  })
  cy.contains('Please enter a specific address that includes street-level information').should(
    'be.visible',
  )

  // validate success
  cy.selectFromComboBox({
    trigger: cy.get('input[placeholder="Your full address"]'),
    searchText: '350 Fifth Avenue New York, NY 10118',
  })

  cy.contains(/Your representative is \w+/gim).should('be.visible')
  cy.contains('button', 'Call').click()

  cy.contains('button', 'Call complete').click()

  // waiting for Inngest to consume job
  cy.contains('Nice work!')

  // validate database
  cy.queryDb('SELECT * FROM user_action WHERE action_type="CALL"').then((result: any) => {
    expect(result.length, 'user_action to exist in database').to.equal(1)
  })
})
