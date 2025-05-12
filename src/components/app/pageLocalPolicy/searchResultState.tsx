import { StateCard } from '@/components/app/pageLocalPolicy/stateCard'
import { SearchResultStateProps } from '@/components/app/pageLocalPolicy/types'

export function SearchResultState({ countryCode, result, states, urls }: SearchResultStateProps) {
  const code = result.administrativeAreaLevel1.toUpperCase()
  const name = states[code]

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h2 className="text-lg font-semibold">Your state</h2>
      <StateCard
        countryCode={countryCode}
        state={{
          code,
          name,
        }}
        urls={urls}
      />
    </div>
  )
}
