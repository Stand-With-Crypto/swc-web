import { faker } from '@faker-js/faker'
import { Prisma, UserActionPollAnswer } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { USUserActionPollCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

const MOCK_POLL_IDS = Object.values(USUserActionPollCampaignName)
const POLL_ANSWER_OPTIONS = ['Mike Tyson', 'Nick Cage', 'John Cena', 'The Rock']

export function mockCreateUserActionPollAnswerInput() {
  return {
    answer: faker.helpers.arrayElement(POLL_ANSWER_OPTIONS),
    isOtherAnswer: true,
    userActionCampaignName: faker.helpers.arrayElement(MOCK_POLL_IDS),
  } satisfies Omit<Prisma.UserActionPollAnswerCreateInput, 'userActionPoll'>
}

export function mockUserActionPollAnswer() {
  return {
    ...mockCreateUserActionPollAnswerInput(),
    id: fakerFields.id(),
  }
}
