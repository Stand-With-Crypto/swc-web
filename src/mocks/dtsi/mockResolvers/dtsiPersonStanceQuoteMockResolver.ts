import { DTSI_PersonStanceQuoteResolvers } from '@/data/dtsi/generated'
import { MOCK_RICH_TEXT } from '@/mocks/misc/mockRichText'
import { faker } from '@faker-js/faker'

export const dtsiPersonStanceQuoteMockResolver = (): Partial<DTSI_PersonStanceQuoteResolvers> => ({
  richTextDescription: () => MOCK_RICH_TEXT,
  sourceUrl: () => faker.internet.url(),
})
