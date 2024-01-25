import { DTSI_TwitterAccountResolvers } from '@/data/dtsi/generated'

export function dtsiTwitterAccountMockResolver(): Partial<DTSI_TwitterAccountResolvers> {
  return {
    username: () => 'RepRitchie',
  }
}
