import { fakerFields } from '@/mocks/fakerUtils'
import { Prisma, UserActionVotingDay } from '@prisma/client'

export function mockCreateUserActionVotingDayInput() {
  return {
    votingYear: '2024',
  } satisfies Prisma.UserActionVotingDayCreateInput
}

export function mockUserActionVotingDay(): UserActionVotingDay {
  return {
    ...mockCreateUserActionVotingDayInput(),
    id: fakerFields.id(),
  }
}
