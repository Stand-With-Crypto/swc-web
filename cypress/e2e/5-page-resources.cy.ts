/// <reference types="cypress" />

it('page - resources interactions', () => {
  cy.visit('/resources')

  cy.get('h1').contains('Your voice will shape the future of crypto in America')
  cy.get('h2').contains(
    'Every day lawmakers are discussing policies and regulations that impact your ability to use crypto. They care what you think, but you have to make sure that you are connecting with your lawmakers.',
  )
  cy.get('h2').contains(
    ' The US sat idly by with semiconductor manufacturing, and now 92% of advanced production is located in Taiwan and South Korea. We can’t let history repeat itself, and must ensure the US isn’t sidelined from the future financial system.',
  )

  cy.get('h2').contains('Events')
  cy.get('p').contains(
    'Learn more about recent and upcoming events to mobilize the crypto community.',
  )
  cy.get('[data-test-id=event-card').should('have.length', 3)

  cy.get('h2').contains('Policy')
  cy.get('p').contains(
    'Learn more about the pending bills and resolutions that can shape the industry’s future.',
  )
  cy.get('[data-test-id=policy-card').should('have.length', 2)

  cy.get('h2').contains('Get involved')
  cy.get('p').contains('The future of crypto is in your hands. Here’s how you can help.')
})
