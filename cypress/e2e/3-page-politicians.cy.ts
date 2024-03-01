/// <reference types="cypress" />

it('page - politicians interactions', () => {
  cy.visit('/politicians')

  cy.get('h1').contains('politicians')
  cy.get('tbody').find('tr').should('have.length', 100)
  // filter the table by state
  // find the element with the data-e2e attribute of "state-filter-trigger"
  cy.get('[data-testid="state-filter-trigger"]').click()
  cy.get('[role="option"]').contains('AK').click()
  cy.get('tbody').find('tr').should('have.length', 3)
  cy.get('[data-testid="state-filter-trigger"]').click()
  cy.get('[role="option"]').contains('All').click()
  cy.get('tbody').find('tr').should('have.length', 100)
  // filter the table by name
  cy.get('input[placeholder="Search by name or state"]').type('Cynthia Lummis')
  cy.get('tbody').find('tr').should('have.length', 1)
  cy.get('input[placeholder=""Search by name or state"]').clear()
  cy.get('tbody').find('tr').should('have.length', 100)

  // enter your address and see your rep
  cy.selectFromComboBox({
    trigger: cy.get('input[placeholder="Enter your address"]'),
    searchText: '350 Fifth Avenue New York, NY 10118',
  })
  cy.contains('Jerry Nadler', { timeout: 10000 })

  // clear your address
  cy.contains('350 Fifth Avenue, New York, NY 10118, USA').click()
  cy.get('input[placeholder="Enter your address"]')
})
