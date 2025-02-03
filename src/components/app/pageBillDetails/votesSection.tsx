'use client'

import { useMemo, useState } from 'react'

import { AvatarGrid } from '@/components/app/pageBillDetails/avatarGrid'
import { DTSIAvatarBox } from '@/components/app/pageBillDetails/dtsiAvatarBox'
import { FILTER_KEYS, Filters, getDefaultFilters } from '@/components/app/pageBillDetails/filters'
import { DTSI_BillPersonRelationshipType, DTSI_PersonRoleStatus } from '@/data/dtsi/generated'
import { DTSIBillDetails } from '@/data/dtsi/queries/queryDTSIBillDetails'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const AVATAR_SIZE = 126

interface VotesSectionProps {
  votes: DTSIBillDetails['relationships']
  countryCode: SupportedCountryCodes
}

export function VotesSection(props: VotesSectionProps) {
  const { votes, countryCode } = props

  const [filters, setFilters] = useState<FILTER_KEYS>(getDefaultFilters())

  const filteredVotes = useMemo(() => {
    return votes.filter(vote => {
      const { stance, role, party } = filters
      return (
        (stance === 'All' || vote.relationshipType === stance) &&
        (role === 'All' ||
          (role === vote.person.primaryRole?.roleCategory &&
            vote.person.primaryRole?.status === DTSI_PersonRoleStatus.HELD)) &&
        (party === 'All' || vote.person.politicalAffiliationCategory === party)
      )
    })
  }, [votes, filters])

  const votesByType = useMemo(
    () =>
      filteredVotes.reduce((map, vote) => {
        const type = vote.relationshipType

        if (!map.has(type)) {
          map.set(type, [])
        }

        map.get(type)?.push(vote.person)

        return map
      }, new Map<DTSI_BillPersonRelationshipType, DTSIBillDetails['relationships'][0]['person'][]>()),
    [filteredVotes],
  )

  const sponsors = votesByType.get(DTSI_BillPersonRelationshipType.SPONSOR)
  const coSponsors = votesByType.get(DTSI_BillPersonRelationshipType.COSPONSOR)
  const votedFor = votesByType.get(DTSI_BillPersonRelationshipType.VOTED_FOR)
  const votedAgainst = votesByType.get(DTSI_BillPersonRelationshipType.VOTED_AGAINST)

  const showSection = (type: FILTER_KEYS['stance']) => {
    return filters.stance === 'All' || filters.stance === type
  }

  return (
    <section className="space-y-16 text-center sm:text-start">
      <div className="flex flex-col flex-wrap items-center justify-center gap-6 lg:flex-row lg:justify-between">
        <p className="flex-shrink-0 text-lg font-semibold">See how politicians voted</p>

        <Filters
          className="w-full max-w-[620px] flex-1"
          filtersValue={filters}
          onChange={setFilters}
        />
      </div>

      {showSection(DTSI_BillPersonRelationshipType.SPONSOR) && (
        <div className="space-y-8">
          <p className="text-lg font-semibold">Sponsors</p>
          <AvatarGrid nItems={14}>
            {sponsors?.length ? (
              sponsors?.map((person, i) => (
                <DTSIAvatarBox
                  countryCode={countryCode}
                  key={i}
                  person={person}
                  size={AVATAR_SIZE}
                />
              ))
            ) : (
              <p className="text-fontcolor-muted">No sponsors</p>
            )}
          </AvatarGrid>
        </div>
      )}

      {showSection(DTSI_BillPersonRelationshipType.COSPONSOR) && (
        <div className="space-y-8">
          <p className="text-lg font-semibold">Co-Sponsors</p>
          <AvatarGrid nItems={14}>
            {coSponsors?.length ? (
              coSponsors?.map((person, i) => (
                <DTSIAvatarBox
                  countryCode={countryCode}
                  key={i}
                  person={person}
                  size={AVATAR_SIZE}
                />
              ))
            ) : (
              <p className="text-fontcolor-muted">No co-sponsors</p>
            )}
          </AvatarGrid>
        </div>
      )}

      {showSection(DTSI_BillPersonRelationshipType.VOTED_FOR) && (
        <div className="space-y-8">
          <p className="text-lg font-semibold">Voted for</p>
          <AvatarGrid nItems={14}>
            {votedFor?.length ? (
              votedFor?.map((person, i) => (
                <DTSIAvatarBox
                  countryCode={countryCode}
                  key={i}
                  person={person}
                  size={AVATAR_SIZE}
                />
              ))
            ) : (
              <p className="text-fontcolor-muted">No votes for</p>
            )}
          </AvatarGrid>
        </div>
      )}

      {showSection(DTSI_BillPersonRelationshipType.VOTED_AGAINST) && (
        <div className="space-y-8">
          <p className="text-lg font-semibold">Voted against</p>
          <AvatarGrid nItems={14}>
            {votedAgainst?.length ? (
              votedAgainst?.map((person, i) => (
                <DTSIAvatarBox
                  countryCode={countryCode}
                  key={i}
                  person={person}
                  size={AVATAR_SIZE}
                />
              ))
            ) : (
              <p className="text-fontcolor-muted">No votes against</p>
            )}
          </AvatarGrid>
        </div>
      )}
    </section>
  )
}
