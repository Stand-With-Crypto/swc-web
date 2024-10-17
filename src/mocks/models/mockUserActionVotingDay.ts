import { Prisma, UserActionVotingDay } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'

export function mockCreateUserActionVotingDayInput() {
  return {
    usaState: fakerFields.stateCode({ abbreviated: true }),
    votingYear: new Date().getFullYear().toString(),
  } satisfies Prisma.UserActionVotingDayCreateInput
}

export function mockUserActionVotingDay(): UserActionVotingDay {
  return {
    ...mockCreateUserActionVotingDayInput(),
    id: fakerFields.id(),
  }
}
