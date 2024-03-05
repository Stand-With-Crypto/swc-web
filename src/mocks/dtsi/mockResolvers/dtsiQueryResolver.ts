import { times } from 'lodash-es'

import { DTSI_QueryPeopleArgs, DTSI_QueryResolvers } from '@/data/dtsi/generated'

export const dtsiQueryResolver = (): Partial<DTSI_QueryResolvers> => ({
  people: _args => {
    const args = _args as DTSI_QueryPeopleArgs
    if (args.slugIn) {
      return args.slugIn.map(slug => ({ slug }))
    }
    const total = args.limit ? (args.limit > 1000 ? 750 : args.limit) : 10
    return times(total).map(() => ({})) as any
  },
})
