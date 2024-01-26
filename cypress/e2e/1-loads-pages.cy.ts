/// <reference types="cypress" />

it('sanity checks that all the pages loaded as expected', () => {
  cy.visit('/')
  cy.get('h1').contains('If you care')
  // verify the mission page loads
  cy.visit('/about')
  cy.get('h1').contains('Join the fight')

  cy.visit('/leaderboard')
  cy.get('h1').contains('Our community')

  cy.visit('/politicians')
  cy.get('h1').contains('politicians')

  cy.visit('/resources')
  cy.get('h1').contains('TODO')

  cy.visit('/donate')
  cy.get('h1').contains('Protect the future of crypto')
})
