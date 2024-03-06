/// <reference types="cypress" />

describe('ensure basic MySQL database functionalities work', () => {
  it('create a table', function () {
    cy.executeDb('CREATE TABLE person (age int, first_name varchar(255), city varchar(255))')
  })

  it('insert rows into the table', function () {
    cy.executeDb(
      `INSERT INTO person (age, first_name, city) VALUES
      (21, "Apple", "San Jose"),
      (42, "Banana", "San Diego"),
      (63, "Pear", "Los Angeles");`,
    ).then((result: any) => {
      expect(result).to.equal(3)
    })
  })

  it('update an entry in the table and verify', function () {
    cy.executeDb(`UPDATE person SET city="New York" WHERE first_name="Banana"`).then(
      (result: any) => {
        expect(result).to.equal(1)
      },
    )
    cy.queryDb(`SELECT first_name FROM person WHERE city="New York"`).then((result: any) => {
      expect(result[0].first_name).to.equal('Banana')
    })
  })

  it('verify that there is only one row where the city is "San Jose"', function () {
    cy.queryDb(`SELECT * FROM person WHERE city="San Jose"`).then((result: any) => {
      expect(result.length).to.equal(1)
    })
  })

  it('delete a table', function () {
    cy.executeDb(`DROP TABLE person`)
  })
})
