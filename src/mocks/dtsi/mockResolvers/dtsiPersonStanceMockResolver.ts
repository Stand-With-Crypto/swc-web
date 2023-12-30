import { DTSI_PersonStanceResolvers, DTSI_PersonStanceType } from '@/data/dtsi/generated'
import { MOCK_RICH_TEXT } from '@/mocks/misc/mockRichText'
import { faker } from '@faker-js/faker'

export const dtsiPersonStanceMockResolver = (): Partial<DTSI_PersonStanceResolvers> => ({
  stanceType: () => faker.helpers.arrayElement(Object.values(DTSI_PersonStanceType)),
})
