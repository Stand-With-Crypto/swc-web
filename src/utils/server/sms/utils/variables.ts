import { template } from 'lodash-es'

interface SMSVariables {
  userId: string | undefined
  sessionId: string | undefined
  firstName: string | undefined
  lastName: string | undefined
}

export type UserSMSVariables = Partial<SMSVariables>

export function applySMSVariables(message: string, userSMSVariables: UserSMSVariables) {
  const variables: SMSVariables = {
    firstName: undefined,
    lastName: undefined,
    sessionId: undefined,
    userId: undefined,
  }
  const compiled = template(message)
  return compiled({ ...variables, ...userSMSVariables })
}
