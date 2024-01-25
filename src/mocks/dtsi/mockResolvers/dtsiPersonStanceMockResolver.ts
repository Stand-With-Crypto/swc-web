import { DTSI_PersonStanceResolvers, DTSI_PersonStanceType } from '@/data/dtsi/generated'
import { faker } from '@faker-js/faker'

export function dtsiPersonStanceMockResolver(): Partial<DTSI_PersonStanceResolvers> {
  return {
    stanceType: () => faker.helpers.arrayElement(Object.values(DTSI_PersonStanceType)),
  }
}
