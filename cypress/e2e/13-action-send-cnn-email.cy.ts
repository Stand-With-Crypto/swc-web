/// <reference types="cypress" />

describe('action - send cnn email about the presidential debate', () => {
  it('should be able to send the cnn email successfully', () => {
    cy.visit('/')

    cy.contains(/Ask CNN to include crypto questions at the Presidential Debate/i).click()

    cy.contains(
      /Crypto deserves to be a topic at the Presidential Debate. Send a note to CNN and ask them to make sure that the 52 million crypto owners in America are represented on the debate stage./i,
    ).should('be.visible')

    // validates if the default message will be presented before entering the first and last name

    cy.get('textarea').contains(
      'I am one of the 52 million Americans who own cryptocurrency. Crypto can drive American innovation and global leadership by fostering strong consumer protection, creating high-skilled jobs, and strengthening our national security. Unfortunately, bad policy could push this technology overseas, and cost the U.S. nearly 4 million jobs.',
    )

    cy.get('input[placeholder="First name"]').type('John')
    cy.get('input[placeholder="Last name"]').type('Doe')
    cy.get('input[placeholder="Your email"]').type('johndoe@gmail.com')

    // validates if the customized message will be presented after entering the first and last name

    cy.get('textarea').contains(
      'My name is John, and I am one of the 52 million Americans who own cryptocurrency. Crypto can drive American innovation and global leadership by fostering strong consumer protection, creating high-skilled jobs, and strengthening our national security. Unfortunately, bad policy could push this technology overseas, and cost the U.S. nearly 4 million jobs.',
    )

    cy.get('button[type="submit"]').click()

    // waiting for Inngest to consume job
    cy.contains('Nice work!')

    // validate database
    cy.queryDb('SELECT * FROM user WHERE first_name="John"').then((result: any) => {
      expect(result.length, 'user to exist in database').to.equal(1)
    })
    cy.queryDb(
      'SELECT * FROM user_action WHERE action_type="EMAIL" AND campaign_name="CNN_PRESIDENTIAL_DEBATE_2024"',
    ).then((result: any) => {
      expect(result.length, 'user_action to exist in database').to.equal(1)
    })
  })

  it('should not change the email message after the user has made some change in the textarea input', () => {
    cy.visit('/')

    cy.contains(/Ask CNN to include crypto questions at the Presidential Debate/i).click()

    cy.contains(
      /Crypto deserves to be a topic at the Presidential Debate. Send a note to CNN and ask them to make sure that the 52 million crypto owners in America are represented on the debate stage./i,
    ).should('be.visible')

    // validates if the default message will be presented before entering the first and last name

    cy.get('textarea').contains(
      'I am one of the 52 million Americans who own cryptocurrency. Crypto can drive American innovation and global leadership by fostering strong consumer protection, creating high-skilled jobs, and strengthening our national security. Unfortunately, bad policy could push this technology overseas, and cost the U.S. nearly 4 million jobs.',
    )

    cy.get('textarea').type('Awesome custom message :D')

    cy.get('input[placeholder="First name"]').type('John')
    cy.get('input[placeholder="Last name"]').type('Doe')

    cy.get('textarea').contains('Awesome custom message :D')
  })

  it('should not be able to send the cnn email without filling all fields', () => {
    cy.visit('/')

    cy.contains(/Ask CNN to include crypto questions at the Presidential Debate/i).click()

    cy.contains(
      /Crypto deserves to be a topic at the Presidential Debate. Send a note to CNN and ask them to make sure that the 52 million crypto owners in America are represented on the debate stage./i,
    ).should('be.visible')

    // validate error messages display
    cy.get('input[placeholder="First name"]').type('John')
    cy.get('input[placeholder="First name"]').clear()
    cy.get('button[type="submit"]').click()
    cy.contains('Please enter your first name')
    cy.contains('Please enter a valid email address')
  })
})
