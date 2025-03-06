import { template } from 'lodash-es'

interface SMSVariables {
  userId: string | undefined
  referralId: string | undefined
  sessionId: string | undefined
  firstName: string | undefined
  lastName: string | undefined
  address:
    | {
        district?: string
        state?:
          | {
              name?: string
              code?: string
            }
          | undefined
      }
    | undefined
  districtRank: number | undefined
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
    districtRank: undefined,
  }
  const compiled = template(message)
  return compiled({ ...variables, ...userSMSVariables })
}
