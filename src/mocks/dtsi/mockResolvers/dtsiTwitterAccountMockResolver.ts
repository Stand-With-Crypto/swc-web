import { DTSI_TwitterAccountResolvers } from '@/data/dtsi/generated'
import { faker } from '@faker-js/faker'

export const dtsiTwitterAccountMockResolver = (): Partial<DTSI_TwitterAccountResolvers> => ({
  username: () => 'RepRitchie',
})
