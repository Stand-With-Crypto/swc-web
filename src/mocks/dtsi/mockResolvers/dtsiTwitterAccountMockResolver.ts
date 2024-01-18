import { DTSI_TwitterAccountResolvers } from '@/data/dtsi/generated'

export const dtsiTwitterAccountMockResolver = (): Partial<DTSI_TwitterAccountResolvers> => ({
  username: () => 'RepRitchie',
})
