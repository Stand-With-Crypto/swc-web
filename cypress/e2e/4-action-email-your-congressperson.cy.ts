/// <reference types="cypress" />

it('action - email your congressperson', () => {
  cy.visit('/')

  cy.contains('Email your Congressperson').click()
  cy.get('[role="dialog"]')

  // validate error messages display
  cy.get('input[placeholder="Your first name"]').type('John')
  cy.get('input[placeholder="Your first name"]').clear()
  cy.get('button[type="submit"]').click()
  cy.contains('Please enter your first name')
  cy.contains('Please enter your last name')
  cy.contains('Please enter a valid email address')
  cy.contains('Please select a valid address')
  cy.contains('Person required to submit')

  // validate invalid address
  cy.selectFromComboBox({
    trigger: cy.get('input[placeholder="Your full address"]'),
    searchText: 'new york',
  })
  cy.contains('Please enter a specific address that includes street-level information')

  // validate success
  cy.get('input[placeholder="Your first name"]').type('John')
  cy.get('input[placeholder="Your last name"]').type('Doe')
  cy.get('input[placeholder="Your email"]').type('johndoe@gmail.com')
  cy.selectFromComboBox({
    trigger: cy.get('input[placeholder="Your full address"]'),
    searchText: '350 Fifth Avenue New York, NY 10118',
  })
  cy.contains('Your representative is Zola Feil Sr')
  cy.get('textarea').type('test message')
  cy.get('button[type="submit"]').click()

  // waiting for Inngest to consume job
  cy.contains('Nice work!')

  // validate database
  cy.queryDb('SELECT * FROM user WHERE first_name="John"').then((result: any) => {
    expect(result.length, 'user to exist in database').to.equal(1)
  })
  cy.queryDb('SELECT * FROM user_action WHERE action_type="EMAIL"').then((result: any) => {
    expect(result.length, 'user_action to exist in database').to.equal(1)
  })
  cy.queryDb('SELECT * FROM user_action_email WHERE sender_email="johndoe@gmail.com"').then(
    (result: any) => {
      expect(result.length, 'user_action_email to exist in database').to.equal(1)
    },
  )
})
