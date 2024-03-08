/// <reference types="cypress" />
it('action - voter registration - Yes flow', () => {
  cy.visit('/')

  cy.contains('Check your voter registration and get a free NFT').click()
  cy.get('[role="dialog"]')

  cy.contains('Yes').click()

  // Claim NFT step
  cy.contains("Claim “I'm a Voter” NFT")
  cy.contains('Claim NFT').click()

  // waiting for Inngest to consume job
  cy.contains('Nice work! You earned a new NFT.')

  // validate database
  cy.queryDb('SELECT * FROM user_action WHERE action_type="VOTER_REGISTRATION"').then(
    (result: any) => {
      expect(result.length, 'user_action to exist in database').to.equal(1)
    },
  )
  cy.clearDb()
})
