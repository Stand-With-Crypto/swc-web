/// <reference types="cypress" />

it('sanity checks that the homepage is loading as expected', () => {
  cy.visit('/')
  // open the main watch CTA and verify the youtube video loads
  cy.contains('Watch').click()
  // verify that there is an iframe on the page with youtube.com in the src
  cy.get('iframe[allowfullscreen]').should('have.attr', 'src').and('include', 'youtube.com')
  // wait so the iframe can fully load
  cy.wait(1000)
  cy.contains('Close').click()

  // verify the donations tab shows top donors
  cy.contains('Top donations').click()
  cy.get('img[alt="position 1 medal"]')

  // verify clicking one of the action cards opens a modal
  cy.contains('Join Stand With Crypto').click()
  cy.contains('Close').click()
})
