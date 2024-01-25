/// <reference types="cypress" />

it('page - politicians interactions', () => {
  cy.visit('/')

  cy.contains('Email your Congressperson').click()
  cy.get('[role="dialog"]')

  // validate error messages display
  cy.get('button[type="submit"]').click()
  cy.contains('Please enter your first name')
  cy.contains('Please enter your last name')
  cy.contains('Please enter a valid email address')
  cy.contains('Please select a valid address')
  cy.contains('Person required to submit')

  // validate invalid address
  cy.get('input[placeholder="Your full address"]').click()
  cy.get('input[placeholder="Type your address..."]').type('new york')
  cy.contains('New York, NY, USA').click()
  cy.contains('No available representative')

  // validate success
  cy.get('input[placeholder="Your first name"]').type('John')
  cy.get('input[placeholder="Your last name"]').type('Doe')
  cy.get('input[placeholder="Your email"]').type('johndoe@gmail.com')
  cy.get('input[placeholder="Your full address"]').click()
  cy.get('input[placeholder="Type your address..."]')
    .clear()
    .type('350 Fifth Avenue New York, NY 10118')
    .wait(1000)
  cy.contains('350 Fifth Avenue, New York, NY 10118, USA').click()
  cy.contains('Your representative is Jerry Nadler')
  cy.get('textarea').type('test message')
  cy.get('button[type="submit"]').click()

  cy.contains('Nice work!')
})
