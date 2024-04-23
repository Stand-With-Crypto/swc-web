import { times } from 'lodash-es'

import { DTSI_PersonRoleCategory, DTSI_QueryResolvers } from '@/data/dtsi/generated'
import { dtsiPersonMockResolver } from '@/mocks/dtsi/mocks/dtsiPersonMockResolver'
import { dtsiPersonRoleMockResolver } from '@/mocks/dtsi/mocks/dtsiPersonRoleResolver'

export const dtsiQueryResolver: Partial<DTSI_QueryResolvers> = {
  peopleByUSCongressionalDistrict: () => {
    return Object.values(DTSI_PersonRoleCategory).map(
      category =>
        ({
          ...dtsiPersonMockResolver(),
          primaryRole: dtsiPersonRoleMockResolver({
            roleCategory: category,
          }),
        }) as any,
    )
  },
  people: (_root, args) => {
    if (args.slugIn) {
      return args.slugIn.map(slug => ({ slug }))
    }
    const total = args.limit ? (args.limit > 1000 ? 750 : args.limit) : 10
    return times(total).map(() => ({})) as any
  },
}
