import { useMemo } from 'react'

import { DTSI_Person, DTSI_PersonPoliticalAffiliationCategory } from '@/data/dtsi/generated'

import { Filters } from './filters'
import { FilterKeys } from './types'

const getVotes = (list: DTSI_Person[], category: DTSI_PersonPoliticalAffiliationCategory) => {
  return list.filter(person => person.politicalAffiliationCategory === category).length
}

export function Header({
  filters,
  setFilters,
  votedAgainst,
  votedFor,
}: {
  filters: FilterKeys
  setFilters: React.Dispatch<React.SetStateAction<FilterKeys>>
  votedAgainst: DTSI_Person[]
  votedFor: DTSI_Person[]
}) {
  const {
    totalVotesFor,
    totalVotesAgainst,
    totalVotesForDemocrat,
    totalVotesForRepublican,
    totalVotesAgainstDemocrat,
    totalVotesAgainstRepublican,
  } = useMemo(() => {
    const totalVotesFor = votedFor.length
    const totalVotesAgainst = votedAgainst.length

    const totalVotesForDemocrat = getVotes(
      votedFor,
      DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
    )

    const totalVotesForRepublican = getVotes(
      votedFor,
      DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
    )

    const totalVotesAgainstDemocrat = getVotes(
      votedAgainst,
      DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
    )

    const totalVotesAgainstRepublican = getVotes(
      votedAgainst,
      DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
    )

    return {
      totalVotesFor,
      totalVotesAgainst,
      totalVotesForDemocrat,
      totalVotesForRepublican,
      totalVotesAgainstDemocrat,
      totalVotesAgainstRepublican,
    }
  }, [votedFor, votedAgainst])

  return (
    <div className="mb-10 w-full overflow-hidden">
      <div className="flex flex-col flex-wrap items-center justify-center gap-6 p-5 sm:flex-row sm:justify-between sm:p-9">
        <strong className="flex-shrink-0 text-3xl">Votes</strong>

        <div className="flex items-end gap-4">
          <div className="mb-1 mr-4 flex flex-col gap-2 text-left text-lg">
            <strong>For</strong>
            <strong>Against</strong>
          </div>

          <div className="flex flex-col items-center gap-2 text-xl">
            <span className="text-sm">Total</span>

            <div className="flex flex-col gap-2 rounded-lg bg-muted px-3 py-2 text-center">
              <strong>{totalVotesFor}</strong>
              <strong>{totalVotesAgainst}</strong>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 text-xl">
            <span className="text-sm">(D)</span>

            <div className="flex flex-col gap-2 rounded-lg px-3 py-2 text-center text-blue-400">
              <strong>{totalVotesForDemocrat}</strong>
              <strong>{totalVotesAgainstDemocrat}</strong>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 text-xl">
            <span className="text-sm">(R)</span>

            <div className="flex flex-col gap-2 rounded-lg px-3 py-2 text-center text-red-700">
              <strong>{totalVotesForRepublican}</strong>
              <strong>{totalVotesAgainstRepublican}</strong>
            </div>
          </div>
        </div>
      </div>

      <Filters filtersValue={filters} onChange={setFilters} />
    </div>
  )
}
