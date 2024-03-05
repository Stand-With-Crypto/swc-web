import { defineConfig } from 'cypress'
import mysql from 'mysql'

export default defineConfig({
  projectId: process.env.CYPRESS_PROJECT_ID,
  // iPhone 12 Pro resolution
  viewportWidth: 390,
  viewportHeight: 844,
  defaultCommandTimeout: 10000,
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      on('task', {
        queryDb: query => {
          return queryTestDb(query, config)
        },
      })
    },
  },
  env: {
    db: {
      host: '127.0.0.1',
      user: 'root',
      password: 'root',
      database: 'swc-web',
    },
  },
})

/**
 * Query the test database using the provided query.
 *
 * @param query
 * @param config
 * @returns
 */
function queryTestDb(query: string | mysql.QueryOptions, config: Cypress.PluginConfigOptions) {
  const connection = mysql.createConnection(config.env.db)
  connection.connect()
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) reject(error)
      else {
        connection.end()
        return resolve(results)
      }
    })
  })
}
