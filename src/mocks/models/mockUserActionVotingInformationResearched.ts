import { Prisma, UserActionVotingInformationResearched } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'

export function mockCreateUserActionVotingInformationResearchedInput() {
  return {
    shouldReceiveNotifications: false,
  } satisfies Prisma.UserActionVotingInformationResearchedCreateInput
}

export function mockUserActionVotingInformationResearched(): UserActionVotingInformationResearched {
  return {
    ...mockCreateUserActionVotingInformationResearchedInput(),
    id: fakerFields.id(),
    addressId: fakerFields.id(),
  }
}
