/// <reference types="cypress" />

describe('page - politicians', () => {
  beforeEach(() => {
    cy.visit('/politicians')
    cy.get('[data-testid="table-skeleton"]').should('not.exist')
  })

  it('should render the page', () => {
    cy.get('h1').contains('politicians')
    cy.get('tbody').find('tr').should('have.length', 100)
    cy.get('[data-testid="table-skeleton"]').should('not.exist')
    cy.get('input[placeholder="Enter your address"]').should('be.visible')
  })

  it('should show a rep when entering an valid address and clear when clicking the clear button', () => {
    cy.selectFromComboBox({
      trigger: cy.get('input[placeholder="Enter your address"]'),
      searchText: '350 Fifth Avenue New York, NY 10118',
      typingRequired: true,
    })
    cy.get('[data-test-id="dtsi-people-associated-with-address"]', { timeout: 10000 }).should(
      'exist',
    )
    cy.contains('350 Fifth Avenue, New York, NY 10118').click()
    cy.get('input[placeholder="Enter your address"]')
  })

  it('should search by name', () => {
    cy.get('input[placeholder="Search by name or state"]').as('nameFilter').should('be.visible')
    cy.get('@nameFilter').type('Cynthia Lummis')
    cy.get('tbody').find('tr').should('have.length', 1)
    cy.get('@nameFilter').clear()
    cy.get('tbody').find('tr').should('have.length', 100)
  })

  describe('filters', () => {
    it('should filter by state', () => {
      cy.selectFromSelect({
        trigger: cy.get('[data-testid="state-filter-trigger"]').as('stateFilterTrigger'),
        option: 'AK',
      })

      cy.get('tbody')
        .find('td:nth-child(4)')
        .each($cell => {
          const value = $cell.text()
          cy.wrap(value).should('eq', 'Alaska')
        })

      cy.scrollTo('top')

      cy.selectFromSelect({
        trigger: cy.get('@stateFilterTrigger'),
        option: 'All',
      })
      cy.get('tbody').find('tr').should('have.length', 100)
    })

    it('should filter by role', () => {
      cy.selectFromSelect({
        trigger: cy.get('[data-testid="role-filter-trigger"]').as('roleFilterTrigger'),
        option: 'Senator',
      })
      cy.get('tbody')
        .find('td:nth-child(3)')
        .each($cell => {
          const value = $cell.text()
          cy.wrap(value).should('eq', 'Senator')
        })

      cy.selectFromSelect({
        trigger: cy.get('@roleFilterTrigger'),
        option: 'All',
      })
      cy.get('tbody').find('tr').should('have.length', 100)
    })
  })
})
