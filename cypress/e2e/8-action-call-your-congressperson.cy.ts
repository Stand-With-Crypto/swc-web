/// <reference types="cypress" />

it('action - call your congressperson', () => {
  cy.visit('/')

  cy.contains('Call your Congressperson').click()
  cy.get('[role="dialog"]')

  cy.get('button[name="Continue"]').click()

  // validate error messages display
  cy.selectFromComboBox({
    trigger: cy.get('input[placeholder="Your full address"]'),
    searchText: 'berlin germany',
  })
  cy.contains('Please enter a US-based address.')

  cy.selectFromComboBox({
    trigger: cy.get('input[placeholder="Your full address"]'),
    searchText: 'new york',
  })
  cy.contains('Please enter a specific address that includes street-level information')

  // validate success
  cy.selectFromComboBox({
    trigger: cy.get('input[placeholder="Your full address"]'),
    searchText: '350 Fifth Avenue New York, NY 10118',
  })
  cy.get('button[name="Continue"]').click()

  //
  cy.contains('Your representative is Zola Feil Sr')
  cy.get('button[name="Call"]').click()

  cy.get('button[name="Call complete"]').click()

  // waiting for Inngest to consume job
  cy.contains('Nice work!')

  // validate database
  cy.queryDb('SELECT * FROM user_action WHERE action_type="CALL"').then((result: any) => {
    expect(result.length, 'user_action to exist in database').to.equal(1)
  })
})
