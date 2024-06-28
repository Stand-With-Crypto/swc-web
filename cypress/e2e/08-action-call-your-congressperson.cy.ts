/// <reference types="cypress" />

it('action - call your congressperson', () => {
  cy.viewport('iphone-6')
  cy.visit('/')

  // wait for actions to show up
  cy.wait(1000)

  // validate CTA button
  cy.contains('div', /Call your (congressperson|senator)/).as('ctaButton')
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
    searchText: 'Berliner Bogen, Anckelmannsplatz, Hamburg, Germany',
    typingRequired: true,
  })
  cy.contains('Please enter a US-based address.').should('be.visible')

  // validate success
  cy.selectFromComboBox({
    trigger: cy.get('input[placeholder="Your full address"]'),
    searchText: '350 Fifth Avenue New York, NY 10118',
    typingRequired: true,
  })
  cy.contains(/Your (representative is Jerrold Nadler|senator is Kirsten Gillibrand)/).should(
    'be.visible',
  )

  /**
   * Stubbing window.confirm to prevent the browser from opening the phone app.
   */
  cy.on('window:confirm', () => false)

  cy.get('@ctaDialog').find('a[type="button"]').contains('Call').as('callButton')

  /**
   * Prevent browser from opening the phone app.
   */
  cy.get('@callButton')
    .should('be.visible')
    .then($el => {
      $el.on('click', e => {
        e.preventDefault()
      })
    })
  cy.get('@callButton').click()

  cy.get('@ctaDialog').contains('button', 'Call complete').should('be.visible').click()

  // waiting for Inngest to consume job
  cy.contains('Nice work!')

  // validate database
  cy.queryDb('SELECT * FROM user_action WHERE action_type="CALL"').then((result: any) => {
    expect(result.length, 'user_action to exist in database').to.equal(1)
  })
})
