import { describe, expect, it } from '@jest/globals'

import { applySMSVariables, UserSMSVariables } from '@/utils/server/sms/utils/variables'

describe('applySMSVariables', () => {
  it('should replace all variables correctly', () => {
    const message = 'Hello <%= firstName %> <%= lastName %>, your session ID is <%= sessionId %>.'
    const variables: UserSMSVariables = { firstName: 'Alice', lastName: 'Doe', sessionId: 'ABC123' }
    const result = applySMSVariables(message, variables)
    expect(result).toBe('Hello Alice Doe, your session ID is ABC123.')
  })

  it('should replace missing variables with an empty string', () => {
    const message = 'Hello <%= firstName %> <%= lastName %>, user ID: <%= userId %>.'
    const variables: UserSMSVariables = { firstName: 'Bob' }
    const result = applySMSVariables(message, variables)
    expect(result).toBe('Hello Bob , user ID: .')
  })

  it('should use default values when variables are missing', () => {
    const message = 'Hello <%= firstName %>, session: <%= sessionId %>.'
    // Set default values in variables before calling the function
    const variables: UserSMSVariables = { firstName: 'Alice', sessionId: 'N/A' }
    const result = applySMSVariables(message, variables)
    expect(result).toBe('Hello Alice, session: N/A.')
  })

  it('should display conditional content based on variable presence', () => {
    const message =
      "Hello <%= firstName %>, <%= userId ? 'your user ID is ' + userId : 'no user ID available' %>."
    const variables: UserSMSVariables = { firstName: 'Bob', userId: 'USER123' }
    const result = applySMSVariables(message, variables)
    expect(result).toBe('Hello Bob, your user ID is USER123.')
  })

  it('should display variables inside objects', () => {
    const message = 'Your district is <%= address.district.name %>.'
    const variables: UserSMSVariables = {
      address: {
        district: { name: 'CA-12' },
      },
    }
    const result = applySMSVariables(message, variables)
    expect(result).toBe('Your district is CA-12.')
  })

  it('should not break if accessing a variable inside a missing object', () => {
    const message = 'Your state is <%= address?.state?.name %>.'
    const variables: UserSMSVariables = {
      address: {
        district: { name: 'CA-12' },
      },
    }
    const result = applySMSVariables(message, variables)
    expect(result).toBe('Your state is .')
  })
})
