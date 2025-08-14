'use client'

import { useMemo, useState } from 'react'

import { BillDetails } from '@/data/bills/types'
import { DTSI_BillPersonRelationshipType, DTSI_Person } from '@/data/dtsi/generated'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { getDefaultFilters } from './constants'
import { Header } from './header'
import { Sponsors } from './sponsors'
import { FilterKeys, StandardOption } from './types'
import { VotedAgainst } from './votedAgainst'
import { VotedFor } from './votedFor'

interface VotesSectionProps {
  countryCode: SupportedCountryCodes
  relationships: BillDetails['relationships']
  stanceScore: number | null | undefined
}

const filterHelper = (list: DTSI_Person[], filters: FilterKeys) => {
  const { role, party } = filters
  return list.filter(item => {
    return (
      (role === StandardOption || item.primaryRole?.roleCategory === role) &&
      (party === StandardOption || item.politicalAffiliationCategory === party)
    )
  })
}

const shouldReturn = (
  stance: FilterKeys['stance'],
  type: DTSI_BillPersonRelationshipType | typeof StandardOption,
) => {
  return stance === StandardOption || stance === type
}

export function VotesSection({ countryCode, relationships, stanceScore }: VotesSectionProps) {
  const { coSponsors, sponsors, votedAgainst, votedFor } = relationships

  const [filters, setFilters] = useState<FilterKeys>(getDefaultFilters())

  const filteredVotes = useMemo(() => {
    const { stance } = filters

    let filteredSponsors: DTSI_Person[] = []
    let filteredCoSponsors: DTSI_Person[] = []

    if (shouldReturn(stance, DTSI_BillPersonRelationshipType.SPONSOR)) {
      filteredSponsors = filterHelper(sponsors, filters)
      filteredCoSponsors = filterHelper(coSponsors, filters)
    }

    const filteredVotedFor = shouldReturn(stance, DTSI_BillPersonRelationshipType.VOTED_FOR)
      ? filterHelper(votedFor, filters)
      : []
    const filteredVotedAgainst = shouldReturn(stance, DTSI_BillPersonRelationshipType.VOTED_AGAINST)
      ? filterHelper(votedAgainst, filters)
      : []

    return {
      filteredSponsors,
      filteredCoSponsors,
      filteredVotedFor,
      filteredVotedAgainst,
    }
  }, [sponsors, coSponsors, votedFor, votedAgainst, filters])

  return (
    <section className="container mx-auto rounded-3xl border border-muted px-0 pb-6 text-center font-sans sm:text-start">
      <Header
        filters={filters}
        setFilters={setFilters}
        votedAgainst={votedAgainst}
        votedFor={votedFor}
      />

      <div className="relative z-10">
        {shouldReturn(filters.stance, DTSI_BillPersonRelationshipType.SPONSOR) && (
          <Sponsors
            coSponsors={filteredVotes.filteredCoSponsors}
            countryCode={countryCode}
            sponsors={filteredVotes.filteredSponsors}
          />
        )}

        {shouldReturn(filters.stance, StandardOption) && (
          <div className="bt-0 mt-10 w-full border border-muted" />
        )}

        {shouldReturn(filters.stance, DTSI_BillPersonRelationshipType.VOTED_FOR) && (
          <VotedFor
            countryCode={countryCode}
            stanceScore={stanceScore}
            votedFor={filteredVotes.filteredVotedFor}
          />
        )}

        {shouldReturn(filters.stance, DTSI_BillPersonRelationshipType.VOTED_AGAINST) && (
          <VotedAgainst
            countryCode={countryCode}
            stanceScore={stanceScore}
            votedAgainst={filteredVotes.filteredVotedAgainst}
          />
        )}
      </div>
    </section>
  )
}
