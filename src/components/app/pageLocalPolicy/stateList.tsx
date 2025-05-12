import { useMemo } from 'react'
import Link from 'next/link'

import { StateListProps } from '@/components/app/pageLocalPolicy/types'

export function StateList({ searchResult, states, urls }: StateListProps) {
  const filteredStates = useMemo(() => {
    const statesList = Object.entries(states)

    if (!searchResult) {
      return statesList
    }

    const currentStateCode = searchResult.administrativeAreaLevel1

    return statesList.filter(([stateCode]) => stateCode !== currentStateCode)
  }, [searchResult, states])

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {searchResult && <h2 className="text-lg font-semibold">Explore other states</h2>}
      <ul className="container mx-auto mb-16  flex flex-wrap justify-center gap-x-8 gap-y-6">
        {filteredStates.map(([stateCode, stateName]) => (
          <li className="w-[130px] text-center" key={stateCode}>
            <Link
              className="text-sm font-bold text-primary-cta hover:underline"
              href={urls.localPolicy(stateCode)}
            >
              {stateName}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
