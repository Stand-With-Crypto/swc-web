'use client'

import { useMemo, useState } from 'react'
import orderBy from 'lodash/orderBy'
import { ChevronDown, ThumbsUp } from 'lucide-react'

import { DDHQFooter } from '@/components/app/ddhqFooter'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
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

    const { proCryptoCandidatesElected, antiCryptoCandidatesElected } =
      getCongressLiveResultOverview(getHouseData(house, data))

    return {
      proCryptoCandidatesElected: orderBy(proCryptoCandidatesElected, ['dtsiData.lastName'], 'asc'),
      antiCryptoCandidatesElected: orderBy(
        antiCryptoCandidatesElected,
        ['dtsiData.lastName'],
        'asc',
      ),
    }
  }, [data, house])

  const [isOpen, setIsOpen] = useState({
    proCryptoCandidates: true,
    antiCryptoCandidates: true,
  })

  return (
    <div className="mt-20 space-y-20">
      <div className="container max-w-screen-xl">
        <PageTitle className="text-start" size="sm">
          {getPageTitle(house)}
        </PageTitle>
      </div>

      <div className="container max-w-screen-xl">
        <Collapsible
          className="space-y-8"
          onOpenChange={open => setIsOpen({ ...isOpen, proCryptoCandidates: open })}
          open={isOpen.proCryptoCandidates}
        >
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-full pr-4 transition-all hover:bg-secondary">
              <div className="rounded-full bg-green-100/90 p-3 text-green-700">
                <ThumbsUp />
              </div>
              <span>Pro-crypto candidates</span>
              <div
                className={`transition-transform ${isOpen.proCryptoCandidates ? '-rotate-180' : ''}`}
              >
                <ChevronDown />
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="AnimateCollapsibleContent px-0.5 pb-2">
            <div className="w-full flex-col justify-start gap-6 max-lg:max-w-2xl sm:inline-flex sm:flex-row">
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
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="container max-w-screen-xl">
        <Collapsible
          className="space-y-8"
          onOpenChange={open => setIsOpen({ ...isOpen, antiCryptoCandidates: open })}
          open={isOpen.antiCryptoCandidates}
        >
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-full pr-4 transition-all hover:bg-secondary">
              <div className="rounded-full bg-red-100/90 p-3 text-red-700">
                <ThumbsUp />
              </div>
              <span>Anti-crypto candidates</span>
              <div
                className={`transition-transform ${isOpen.antiCryptoCandidates ? '-rotate-180' : ''}`}
              >
                <ChevronDown />
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="AnimateCollapsibleContent px-0.5 pb-2">
            <div className="w-full flex-col justify-start gap-6 max-lg:max-w-2xl sm:inline-flex sm:flex-row">
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
            </div>
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
