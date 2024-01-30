/// <reference types="cypress" />

it('page - homepage interactions', () => {
  cy.visit('/')
  // open the main watch CTA and verify the youtube video loads
  cy.contains('Watch').click()
  // verify that there is an iframe on the page with youtube.com in the src
  cy.get('iframe[allowfullscreen]').should('have.attr', 'src').and('include', 'youtube.com')
  // wait so the iframe can fully load
  cy.wait(2000)
  cy.contains('Close').click()

  // verify the donations tab shows top donors
  cy.contains('Top donations').click()
  cy.wait(2000)
  cy.get('img[alt="position 1 medal"]')
})
