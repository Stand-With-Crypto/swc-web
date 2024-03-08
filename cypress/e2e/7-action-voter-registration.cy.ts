/// <reference types="cypress" />
it('Yes flow', () => {
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

it('No flow', () => {
  cy.visit('/')

  cy.contains('Check your voter registration and get a free NFT').click()
  cy.get('[role="dialog"]')

  cy.contains('No').click()

  // Voter registration step
  cy.contains("Register to vote and get a free “I'm a Voter” NFT")
  cy.get('button[data-testid="state-filter-trigger"]').click()
  cy.contains('New Jersey').click()
  cy.get('a[data-testid="voter-registration-link"]').click()
  cy.contains('Claim NFT').click()

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

it("I'm not sure flow", () => {
  cy.visit('/')

  cy.contains('Check your voter registration and get a free NFT').click()
  cy.get('[role="dialog"]')

  cy.contains('I’m not sure').click()

  // Check registration step
  cy.contains("Check your registration and get a free “I'm a Voter” NFT")
  cy.get('button[data-testid="state-filter-trigger"]').click()
  cy.contains('Alabama').click()
  cy.get('a[data-testid="voter-registration-link"]').click()
  cy.contains('Claim NFT').click()

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
