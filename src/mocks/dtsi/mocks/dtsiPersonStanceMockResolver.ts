import { faker } from '@faker-js/faker'

import { DTSI_PersonStance, DTSI_PersonStanceType } from '@/data/dtsi/generated'

export const dtsiPersonStanceMockResolver = (): Partial<DTSI_PersonStance> => ({
  stanceType: faker.helpers.arrayElement(Object.values(DTSI_PersonStanceType)),
})
