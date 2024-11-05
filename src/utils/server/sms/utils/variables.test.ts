import { describe, expect, it } from '@jest/globals'

import { applySMSVariables, UserSMSVariables } from '@/utils/server/sms/utils/variables'

describe('applySMSVariables', () => {
  it('replaces all variables correctly', () => {
    const message = 'Hello <%= firstName %> <%= lastName %>, your session ID is <%= sessionId %>.'
    const variables: UserSMSVariables = { firstName: 'Alice', lastName: 'Doe', sessionId: 'ABC123' }
    const result = applySMSVariables(message, variables)
    expect(result).toBe('Hello Alice Doe, your session ID is ABC123.')
  })

  it('replaces missing variables with an empty string', () => {
    const message = 'Hello <%= firstName %> <%= lastName %>, user ID: <%= userId %>.'
    const variables: UserSMSVariables = { firstName: 'Bob' }
    const result = applySMSVariables(message, variables)
    expect(result).toBe('Hello Bob , user ID: .')
  })

  it('uses default values when variables are missing', () => {
    const message = 'Hello <%= firstName %>, session: <%= sessionId %>.'
    // Set default values in variables before calling the function
    const variables: UserSMSVariables = { firstName: 'Alice', sessionId: 'N/A' }
    const result = applySMSVariables(message, variables)
    expect(result).toBe('Hello Alice, session: N/A.')
  })

  it('displays conditional content based on variable presence', () => {
    const message =
      "Hello <%= firstName %>, <%= userId ? 'your user ID is ' + userId : 'no user ID available' %>."
    const variables: UserSMSVariables = { firstName: 'Bob', userId: 'USER123' }
    const result = applySMSVariables(message, variables)
    expect(result).toBe('Hello Bob, your user ID is USER123.')
  })
})
