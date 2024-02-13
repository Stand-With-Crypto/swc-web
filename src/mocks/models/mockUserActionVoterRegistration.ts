import { Prisma, UserActionVoterRegistration } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'

export function mockCreateUserActionVoterRegistrationInput() {
  return {
    state: fakerFields.state(),
  } satisfies Prisma.UserActionVoterRegistrationCreateInput
}

export function mockUserActionVoterRegistration(): UserActionVoterRegistration {
  return {
    ...mockCreateUserActionVoterRegistrationInput(),
    id: fakerFields.id(),
  }
}
