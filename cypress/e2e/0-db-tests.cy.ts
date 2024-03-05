/// <reference types="cypress" />

describe('Ensure basic MySQL database functionalities work', () => {
  it('Create a table', function () {
    cy.task('queryDb', 'CREATE TABLE person (age int, first_name varchar(255), city varchar(255))')
  })

  it('Insert rows into the table', function () {
    cy.task(
      'queryDb',
      `INSERT INTO person (age, first_name, city) VALUES
      (21, "Apple", "San Jose"),
      (42, "Banana", "San Diego"),
      (63, "Pear", "Los Angeles");`,
    ).then((result: any) => {
      expect(result.affectedRows).to.equal(3)
    })
  })

  it('Update an entry in the table and verify', function () {
    cy.task('queryDb', `UPDATE person SET city="New York" WHERE first_name="Banana"`).then(
      (result: any) => {
        // Add type assertion to specify the type of 'result' as any
        expect(result.changedRows).to.equal(1)
      },
    )
    cy.task('queryDb', `SELECT first_name FROM person WHERE city="New York"`).then(
      (result: any) => {
        expect(result[0].first_name).to.equal('Banana')
      },
    )
  })

  it('Verify that there is only one row where the city is "San Jose"', function () {
    cy.task('queryDb', `SELECT COUNT(*) AS "row_count" FROM person WHERE city="San Jose"`).then(
      (result: any) => {
        expect(result[0].row_count).to.equal(1)
      },
    )
  })

  it('Delete a table and verify', function () {
    cy.task('queryDb', `DROP TABLE person`).then((result: any) => {
      expect(result.message).to.equal('')
    })
  })
})
