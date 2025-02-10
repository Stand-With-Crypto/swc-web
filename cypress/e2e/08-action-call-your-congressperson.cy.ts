/// <reference types="cypress" />

import { GoogleCivicInfoOfficial, GoogleCivicInfoResponse } from 'cypress/utils/googleCivicInfo'

it.skip('action - call your congressperson', () => {
  cy.viewport('iphone-6')
  cy.visit('/')

  // wait for actions to show up
  cy.wait(1000)

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
    searchText: 'Berliner Bogen, Anckelmannsplatz, Hamburg, Germany',
    typingRequired: true,
  })
  cy.contains('Please enter a US-based address.').should('be.visible')

  cy.intercept<any, GoogleCivicInfoResponse>(
    {
      method: 'GET',
      url: /https:\/\/www.googleapis.com\/civicinfo\/v2\/representatives\?.*/,
    },
    req => {
      req.reply(res => {
        const originalResponse = res.body

        const mockedOfficial: GoogleCivicInfoOfficial = {
          name: 'Lindsey Olson-Rogahn DDS',
          address: [
            {
              line1: '350 Fifth Avenue',
              city: 'City',
              state: 'NY',
              zip: '10118',
            },
          ],
          party: 'Democratic Party',
          phones: ['(202) 225-5635'],
          photoUrl:
            'https://db0prh5pvbqwd.cloudfront.net/all/images/12b0866e-c3ab-418d-8914-bc0fba709fb5.jpg',
          urls: ['https://nadler.house.gov/'],
          channels: [],
        }

        originalResponse.officials.push(mockedOfficial)

        res.send(originalResponse)
      })
    },
  ).as('getRepresentatives')

  // validate success
  cy.selectFromComboBox({
    trigger: cy.get('input[placeholder="Your full address"]'),
    searchText: '350 Fifth Avenue New York, NY 10118',
    typingRequired: true,
  })

  cy.wait('@getRepresentatives')

  cy.contains(/Your representative is .+/)
    .should('be.visible')
    .invoke('text')
    .then(text => {
      const repName = text.replace('Your representative is ', '').trim().toLowerCase()
      expect(repName).to.not.be.oneOf(['undefined', 'null', ''])
    })

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
