export type UserSMSVariables = Partial<{
  userId: string
  sessionId: string
  firstName: string
  lastName: string
}>

export function applySMSVariables(message: string, variables: UserSMSVariables) {
  return message.replace(
    /{{\s*(\w+)\s*}}/g,
    (_, variable: keyof UserSMSVariables) => variables[variable] ?? '',
  )
}
