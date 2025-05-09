/// <reference types="cypress" />

describe('NavBarGlobalBanner', () => {
  beforeEach(() => {
    cy.clearCookie('OVERRIDE_USER_ACCESS_LOCATION')
  })

  it('should show UK banner when countryCode is "UK"', () => {
    cy.setCookie('OVERRIDE_USER_ACCESS_LOCATION', 'gb')
    cy.setCookie('USER_ACCESS_LOCATION', 'gb')

    cy.visit('/')

    cy.contains('Looking for Stand With Crypto United Kingdom').should('be.visible')
  })

  it('should show UK banner when countryCode is "uk"', () => {
    cy.setCookie('OVERRIDE_USER_ACCESS_LOCATION', 'gb')
    cy.setCookie('USER_ACCESS_LOCATION', 'gb')

    cy.visit('/')

    cy.contains('Looking for Stand With Crypto United Kingdom').should('be.visible')
  })

  it('should show CA banner when countryCode is "CA"', () => {
    cy.setCookie('OVERRIDE_USER_ACCESS_LOCATION', 'ca')
    cy.setCookie('USER_ACCESS_LOCATION', 'ca')

    cy.visit('/')

    cy.contains('Looking for Stand With Crypto Canada').should('be.visible')
  })

  it('should show CA banner when countryCode is "ca"', () => {
    cy.setCookie('OVERRIDE_USER_ACCESS_LOCATION', 'ca')
    cy.setCookie('USER_ACCESS_LOCATION', 'ca')

    cy.visit('/')

    cy.contains('Looking for Stand With Crypto Canada').should('be.visible')
  })

  it('should show US restriction banner when countryCode is not supported', () => {
    cy.setCookie('OVERRIDE_USER_ACCESS_LOCATION', 'br')
    cy.setCookie('USER_ACCESS_LOCATION', 'br')

    cy.visit('/')

    cy.contains(
      'Actions on Stand With Crypto are only available to users based in the United States',
    ).should('be.visible')
  })

  it('should show current US campaign for US users', () => {
    cy.setCookie('OVERRIDE_USER_ACCESS_LOCATION', 'us')
    cy.setCookie('USER_ACCESS_LOCATION', 'us')

    cy.visit('/')

    // THIS ASSERT SHOULD BE UPDATED WHEN WE CHANGE THE CAMPAIGN FOR US.
    // WE DON'T HAVE A CURRENT CAMPAIGN FOR US, SO USERS SHOULD SEE NO BANNER.
    cy.get(
      'Actions on Stand With Crypto are only available to users based in the United States',
    ).should('not.exist')
    cy.get('Looking for Stand With Crypto Canada').should('not.exist')
    cy.get('Looking for Stand With Crypto United Kingdom').should('not.exist')
  })
})
