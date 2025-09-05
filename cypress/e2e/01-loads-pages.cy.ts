/// <reference types="cypress" />

it('sanity checks that all the pages loaded as expected', () => {
  cy.visit('/')
  cy.get('h1').contains('If you care')
  // verify the mission page loads
  cy.visit('/about')
  cy.get('h1').contains('Our mission')

  cy.visit('/community/activity')
  cy.get('h1').contains('Our community')

  cy.visit('/politicians')
  cy.get('h1').contains('politicians')

  cy.visit('/resources')
  cy.get('h1').contains('FIT21 Resources')

  cy.visit('/donate')
  cy.get('h1').contains('Protect the future of crypto')
})
