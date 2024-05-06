/// <reference types="cypress" />

it('action - call your congressperson', () => {
  cy.visit('/')

  // validate CTA button
  cy.contains('div', 'Call your congressperson').as('ctaButton')
  /**
   * Animations are not playing when running in headless mode,
   * so we check for element existence instead of visibility.
   */
  cy.get('@ctaButton').scrollIntoView().should('exist')
  cy.get('@ctaButton').click({ force: true })

  // validate modal
  cy.get('[role="dialog"]').as('ctaDialog').should('be.visible')
  cy.get('@ctaDialog').contains('button', 'Continue').click()

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
  /**
   * Make sure we get the button inside the dialog, not some other button on the page.
   */
  cy.get('@ctaDialog').contains('button', /Call/).click({ force: true })
})
