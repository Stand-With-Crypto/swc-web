import { faker } from '@faker-js/faker'

import { DTSI_PersonStanceResolvers, DTSI_PersonStanceType } from '@/data/dtsi/generated'

export const dtsiPersonStanceMockResolver = (): Partial<DTSI_PersonStanceResolvers> => ({
  stanceType: () => faker.helpers.arrayElement(Object.values(DTSI_PersonStanceType)),
})
