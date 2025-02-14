import { faker } from '@faker-js/faker'
import { Prisma, UserActionPollAnswer } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

const POLL_ANSWER_OPTIONS = ['Mike Tyson', 'Nick Cage', 'John Cena', 'The Rock']

export function mockCreateUserActionPollAnswerInput(campaignName: string) {
  return {
    userActionCampaignName: campaignName,
    answer: faker.helpers.arrayElement(POLL_ANSWER_OPTIONS),
    isOther: faker.helpers.arrayElement([true, false]),
    tenantId: faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES)),
  } satisfies Omit<Prisma.UserActionPollAnswerCreateInput, 'userActionPoll'>
}

export function mockUserActionPollAnswer(campaignName: string): UserActionPollAnswer {
  return {
    ...mockCreateUserActionPollAnswerInput(campaignName),
    id: fakerFields.id(),
    userActionPollId: fakerFields.id(),
  }
}
