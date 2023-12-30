import { DTSI_BillResolvers, DTSI_BillStatus } from '@/data/dtsi/generated'
import { fakerFields } from '@/mocks/fakerUtils'
import { faker } from '@faker-js/faker'

export const dtsiBillMockResolver = (): Partial<DTSI_BillResolvers> => {
  return {
    computedStanceScore: () => fakerFields.dtsiStanceScore(),
    congressDotGovUrl: () => faker.internet.url(),
    formattedSlug: () => 'S.2669',
    govTrackUrl: () => faker.internet.url(),
    pdfUrl: () => faker.internet.url(),
    shortTitle: () => faker.lorem.words(5),
    slug: () => `s2669-118-US`,
    status: () => faker.helpers.arrayElement(Object.values(DTSI_BillStatus)),
    summary: () => faker.lorem.words(100),
    title: () => faker.lorem.words(10),
  }
}
