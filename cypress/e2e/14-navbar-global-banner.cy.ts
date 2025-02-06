/// <reference types="cypress" />

describe('NavBarGlobalBanner', () => {
  beforeEach(() => {
    cy.clearCookie('USER_COUNTRY_CODE')
  })

  it('should show UK banner when countryCode is "UK"', () => {
    cy.setCookie('USER_COUNTRY_CODE', '{%22countryCode%22:%22UK%22%2C%22bypassed%22:true}')

    cy.visit('/')

    cy.contains('Looking for Stand With Crypto United Kingdom').should('be.visible')
  })

  it('should show UK banner when countryCode is "uk"', () => {
    cy.setCookie('USER_COUNTRY_CODE', '{%22countryCode%22:%22uk%22%2C%22bypassed%22:true}')

    cy.visit('/')

    cy.contains('Looking for Stand With Crypto United Kingdom').should('be.visible')
  })

  it('should show CA banner when countryCode is "CA"', () => {
    cy.setCookie('USER_COUNTRY_CODE', '{%22countryCode%22:%22CA%22%2C%22bypassed%22:true}')

    cy.visit('/')

    cy.contains('Looking for Stand With Crypto Canada').should('be.visible')
  })

  it('should show CA banner when countryCode is "ca"', () => {
    cy.setCookie('USER_COUNTRY_CODE', '{%22countryCode%22:%22ca%22%2C%22bypassed%22:true}')

    cy.visit('/')

    cy.contains('Looking for Stand With Crypto Canada').should('be.visible')
  })

  it('should show US restriction banner when countryCode is not supported', () => {
    cy.setCookie('USER_COUNTRY_CODE', '{%22countryCode%22:%22br%22%2C%22bypassed%22:true}')

    cy.visit('/')

    cy.contains(
      'Actions on Stand With Crypto are only available to users based in the United States',
    ).should('be.visible')
  })

  it('should show current US campaign for US users', () => {
    cy.setCookie('USER_COUNTRY_CODE', '{%22countryCode%22:%22US%22%2C%22bypassed%22:true}')

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
