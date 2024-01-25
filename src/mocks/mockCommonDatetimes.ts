import { faker } from '@faker-js/faker'

export function mockCommonDatetimes() {
  return {
    datetimeCreated: faker.date.past(),
    datetimeUpdated: faker.date.past(),
  }
}

export type CommonDatetimes = ReturnType<typeof mockCommonDatetimes>
