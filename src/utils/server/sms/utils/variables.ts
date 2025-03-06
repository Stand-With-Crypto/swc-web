import { template } from 'lodash-es'

interface SMSVariables {
  userId: string | undefined
  referralId: string | undefined
  sessionId: string | undefined
  firstName: string | undefined
  lastName: string | undefined
  address:
    | {
        district?: {
          name?: string
          rank?: number
        }
        state?: {
          name?: string
          code?: string
        }
      }
    | undefined
}

export type UserSMSVariables = Partial<SMSVariables>

export function applySMSVariables(message: string, userSMSVariables: UserSMSVariables) {
  const variables: SMSVariables = {
    firstName: undefined,
    lastName: undefined,
    sessionId: undefined,
    userId: undefined,
    referralId: undefined,
    address: undefined,
  }
  const compiled = template(message)
  return compiled({ ...variables, ...userSMSVariables })
}
