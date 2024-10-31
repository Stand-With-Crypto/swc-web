import { template } from 'lodash-es'

export interface UserSMSVariables {
  userId: string
  sessionId?: string
  firstName: string
  lastName: string
}

export function applySMSVariables(message: string, variables: UserSMSVariables) {
  const compiled = template(message)
  return compiled(
    // All variables within the template must be defined in the variables object. If they’re not, a ReferenceError will be thrown.
    Object.assign<UserSMSVariables, UserSMSVariables>(
      { firstName: '', lastName: '', userId: '', sessionId: undefined },
      variables,
    ),
  )
}
