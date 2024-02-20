/// <reference types="cypress" />

it('page - politicians interactions', () => {
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
  cy.contains('Your representative is Jerry Nadler')
  cy.get('textarea').type('test message')
  cy.get('button[type="submit"]').click()

  // waiting for Inngest to consume job
  cy.contains('Nice work!')
})
