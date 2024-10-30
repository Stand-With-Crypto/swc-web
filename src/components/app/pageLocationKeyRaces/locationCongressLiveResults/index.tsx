'use client'

import { useMemo } from 'react'
import { ChevronUp, ThumbsUp } from 'lucide-react'

import { DDHQFooter } from '@/components/app/ddhqFooter'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { PACFooter } from '@/components/app/pacFooter'
import { getCongressLiveResultOverview } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { PageTitle } from '@/components/ui/pageTitleText'
import { GetAllCongressDataResponse } from '@/data/aggregations/decisionDesk/types'
import { useApiDecisionDeskCongressData } from '@/hooks/useApiDecisionDeskCongressData'
import { SupportedLocale } from '@/intl/locales'
import { gracefullyError } from '@/utils/shared/gracefullyError'

interface LocationCongressLiveResultsProps {
  initialCongressData: GetAllCongressDataResponse
  house: 'senate' | 'house'
  locale: SupportedLocale
}

export function LocationCongressLiveResults(props: LocationCongressLiveResultsProps) {
  const { house = 'house', initialCongressData, locale } = props

  const { data } = useApiDecisionDeskCongressData(initialCongressData)

  const { proCryptoCandidatesElected, antiCryptoCandidatesElected } = useMemo(() => {
    if (!data) return { proCryptoCandidatesElected: [], antiCryptoCandidatesElected: [] }

    return getCongressLiveResultOverview(getHouseData(house, data))
  }, [data, house])

  return (
    <div className="mt-20 space-y-20">
      <div className="container">
        <PageTitle className="text-start" size="sm">
          {getPageTitle(house)}
        </PageTitle>
      </div>

      <div className="container">
        <Collapsible className="space-y-8" defaultOpen>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-full pr-4 transition-all hover:bg-secondary">
              <div className="rounded-full bg-green-100/90 p-3 text-green-700">
                <ThumbsUp />
              </div>
              <span>Pro-crypto candidates</span>
              <div>
                <ChevronUp />
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="AnimateCollapsibleContent">
            <DTSIPersonHeroCardRow className="max-lg:max-w-2xl">
              {proCryptoCandidatesElected.map(person =>
                person.dtsiData ? (
                  <DTSIPersonHeroCard
                    key={person.id}
                    locale={locale}
                    person={person.dtsiData}
                    subheader="role-w-state"
                  />
                ) : null,
              )}
            </DTSIPersonHeroCardRow>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="container">
        <Collapsible className="space-y-8" defaultOpen>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-full pr-4 transition-all hover:bg-secondary">
              <div className="rounded-full bg-red-100/90 p-3 text-red-700">
                <ThumbsUp />
              </div>
              <span>Anti-crypto candidates</span>
              <div>
                <ChevronUp />
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="AnimateCollapsibleContent">
            <DTSIPersonHeroCardRow className="max-lg:max-w-2xl">
              {antiCryptoCandidatesElected.map(person =>
                person.dtsiData ? (
                  <DTSIPersonHeroCard
                    key={person.id}
                    locale={locale}
                    person={person.dtsiData}
                    subheader="role-w-state"
                  />
                ) : null,
              )}
            </DTSIPersonHeroCardRow>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <PACFooter className="container text-center" />
      <DDHQFooter className="container text-center" />
    </div>
  )
}

function getHouseData(house: 'senate' | 'house', data: GetAllCongressDataResponse) {
  switch (house) {
    case 'senate':
      return data.senateDataWithDtsi
    case 'house':
      return data.houseDataWithDtsi
    default:
      gracefullyError({
        msg: 'Invalid house type',
        fallback: data.houseDataWithDtsi,
        hint: {
          tags: {
            domain: 'liveResult',
          },
          extra: {
            house,
          },
        },
      })
  }
}

function getPageTitle(house: 'senate' | 'house') {
  switch (house) {
    case 'senate':
      return 'Senate'
    case 'house':
      return 'House of Representatives'
    default:
      gracefullyError({
        msg: 'Invalid house type',
        fallback: 'House of Representatives',
        hint: {
          tags: {
            domain: 'liveResult',
          },
          extra: {
            house,
          },
        },
      })
  }
}
