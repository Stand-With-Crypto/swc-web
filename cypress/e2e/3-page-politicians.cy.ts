/// <reference types="cypress" />

it('page - politicians interactions', () => {
  cy.visit('/politicians')

  cy.get('h1').contains('politicians')
  cy.get('tbody').find('tr').should('have.length', 100)

  // filter the table by state
  /**
   * find the element with the data-e2e attribute of "state-filter-trigger".
   *
   * When rendering in a small screen Cypress will define the element as not visible
   * due to the parent having `position: fixed`, so we need to scroll it into view.
   *
   * NOTE: If the table rerenders too much the scroll state will reset.
   */
  cy.get('[data-testid="state-filter-trigger"]').as('stateFilterTrigger').scrollIntoView()
  cy.get('@stateFilterTrigger').should('be.visible').click()

  cy.get('[role="option"]').contains('div', 'AK').as('stateOption')
  cy.get('@stateOption').should('be.visible').click({
    // force: true // Bypass visibility checks, not ideal
  })
  cy.get('tbody').find('tr').should('have.length', 4)

  cy.get('@stateFilterTrigger').click()
  cy.get('[role="option"]').contains('div', 'All').click()
  cy.get('tbody').find('tr').should('have.length', 100)

  // filter the table by name
  cy.get('input[placeholder="Search by name or state"]').as('nameFilter').should('be.visible')
  cy.get('@nameFilter').type('Cynthia Lummis')
  cy.get('tbody').find('tr').should('have.length', 1)
  cy.get('@nameFilter').clear()
  cy.get('tbody').find('tr').should('have.length', 100)

  // enter your address and see your rep
  cy.selectFromComboBox({
    trigger: cy.get('input[placeholder="Enter your address"]'),
    searchText: '350 Fifth Avenue New York, NY 10118',
  })
  cy.get('[data-test-id="dtsi-people-associated-with-address"]', { timeout: 10000 })
  // clear your address
  cy.contains('350 Fifth Avenue, New York, NY 10118, USA').click()
  cy.get('input[placeholder="Enter your address"]')
})
