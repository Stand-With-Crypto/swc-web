/// <reference types="cypress" />

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

  const addressForTest = '350 Fifth Avenue New York, NY 10118'
  cy.intercept(
    'GET',
    `/api/public/swc-civic/electoral-zone?address=${encodeURIComponent(addressForTest)}`,
    {
      statusCode: 200,
      body: {
        zoneName: '10',
        stateCode: 'NY',
        countryCode: 'USA',
      },
    },
  ).as('getElectoralZone')

  cy.intercept('GET', '/api/public/dtsi/by-geography/**', {
    statusCode: 200,
    body: [
      {
        slug: 'lindsey-olson-rogahn-dds',
        id: 'a2b37805-4034-4a57-824a-1a877a56d079',
        firstNickname: 'Lindsey',
        lastName: 'Olson-Rogahn DDS',
        nameSuffix: null,
        profilePictureUrl:
          'https://db0prh5pvbqwd.cloudfront.net/all/images/12b0866e-c3ab-418d-8914-bc0fba709fb5.jpg',
        primaryRole: {
          roleCategory: 'legislative-federal',
          title: 'Representative',
          primaryState: 'NY',
          primaryDistrict: '10',
          status: 'active',
          endDate: null,
        },
        politicalAffiliation: {
          name: 'Democratic Party',
        },
      },
    ],
  }).as('getDTSIPeople')

  // validate success
  cy.selectFromComboBox({
    trigger: cy.get('input[placeholder="Your full address"]'),
    searchText: addressForTest,
    typingRequired: true,
  })

  cy.wait('@getElectoralZone')
  cy.wait('@getDTSIPeople')

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
