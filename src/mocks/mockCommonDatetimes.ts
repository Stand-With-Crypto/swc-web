import { faker } from '@faker-js/faker'

export const mockCommonDatetimes = () => ({
  datetimeCreated: faker.date.past(),
  datetimeUpdated: faker.date.past(),
})
