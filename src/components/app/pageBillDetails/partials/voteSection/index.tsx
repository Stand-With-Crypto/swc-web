'use client'

import { useMemo, useState } from 'react'

import {
  FILTER_KEYS,
  getDefaultFilters,
  STANDARD_OPTION,
} from '@/components/app/pageBillDetails/partials/voteSection/filters'
import { BillDetails } from '@/data/bills/types'
import { DTSI_BillPersonRelationshipType, DTSI_Person } from '@/data/dtsi/generated'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import Header from './header'
import Sponsors from './sponsors'
import VotedAgainst from './votedAgainst'
import VotedFor from './votedFor'

interface VotesSectionProps {
  relationships: BillDetails['relationships']
  countryCode: SupportedCountryCodes
}

const filterHelper = (list: DTSI_Person[], filters: FILTER_KEYS) => {
  const { role, party } = filters
  return list.filter(item => {
    return (
      (role === STANDARD_OPTION || item.primaryRole?.roleCategory === role) &&
      (party === STANDARD_OPTION || item.politicalAffiliationCategory === party)
    )
  })
}

const shouldReturn = (
  stance: FILTER_KEYS['stance'],
  type: DTSI_BillPersonRelationshipType | typeof STANDARD_OPTION,
) => {
  return stance === STANDARD_OPTION || stance === type
}

function VotesSection({ relationships, countryCode }: VotesSectionProps) {
  const { sponsors, coSponsors, votedFor, votedAgainst } = relationships

  const [filters, setFilters] = useState<FILTER_KEYS>(getDefaultFilters())

  const filteredVotes = useMemo(() => {
    const { stance } = filters

    const filteredSponsors = shouldReturn(stance, DTSI_BillPersonRelationshipType.SPONSOR)
      ? filterHelper(sponsors, filters)
      : []
    const filteredCoSponsors = shouldReturn(stance, DTSI_BillPersonRelationshipType.SPONSOR)
      ? filterHelper(coSponsors, filters)
      : []
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
    <section className="mx-auto max-w-[1055px] rounded-3xl border border-muted pb-6 text-center sm:text-start">
      <Header
        filters={filters}
        setFilters={setFilters}
        votedAgainst={votedAgainst}
        votedFor={votedFor}
      />

      {shouldReturn(filters.stance, DTSI_BillPersonRelationshipType.SPONSOR) && (
        <Sponsors
          coSponsors={filteredVotes.filteredCoSponsors}
          countryCode={countryCode}
          sponsors={filteredVotes.filteredSponsors}
        />
      )}

      {shouldReturn(filters.stance, STANDARD_OPTION) && (
        <div className="bt-0 mt-10 w-full border border-muted" />
      )}

      {shouldReturn(filters.stance, DTSI_BillPersonRelationshipType.VOTED_FOR) && (
        <VotedFor countryCode={countryCode} votedFor={filteredVotes.filteredVotedFor} />
      )}

      {shouldReturn(filters.stance, DTSI_BillPersonRelationshipType.VOTED_AGAINST) && (
        <VotedAgainst countryCode={countryCode} votedAgainst={filteredVotes.filteredVotedAgainst} />
      )}
    </section>
  )
}

export default VotesSection
