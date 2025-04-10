'use client'
import { useMemo } from 'react'
import { flatten } from 'lodash-es'
import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { getUserActionCTAsByCountry } from '@/components/app/userActionGridCTAs/constants/ctas'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { useCountryCode } from '@/hooks/useCountryCode'
import { fullUrl } from '@/utils/shared/urls'
import {
  getUserActionDeeplink,
  UserActionTypesWithDeeplink,
} from '@/utils/shared/urlsDeeplinkUserActions'
import { UserActionCampaignNames } from '@/utils/shared/userActionCampaigns/index'

export const dynamic = 'error'

export default function UserActionDeepLinks() {
  const countryCode = useCountryCode()
  const router = useRouter()
  const userActionCTAs = getUserActionCTAsByCountry(countryCode)
  const CTAS = useMemo(() => {
    const allCampaigns = flatten(Object.values(userActionCTAs).map(cta => cta.campaigns))

    return allCampaigns.filter(campaign => campaign.isCampaignActive)
  }, [userActionCTAs])

  return (
    <div className="container mx-auto mt-10">
      <div className="space-y-7">
        {CTAS.map(cta => {
          const url = getUserActionDeeplink({
            actionType: cta.actionType as UserActionTypesWithDeeplink,
            campaign: cta.campaignName as UserActionCampaignNames,
            config: {
              countryCode,
            },
          })
          const imageSrc = userActionCTAs[cta.actionType]?.image ?? ''

          return (
            <div key={`${cta.actionType}-${cta.campaignName}`}>
              <p className="mb-2">
                Goes to{' '}
                <ExternalLink className="underline" href={fullUrl(url ?? '')}>
                  {fullUrl(url ?? '')}
                </ExternalLink>
              </p>
              <button
                className="flex w-full items-center justify-between gap-4 rounded-3xl bg-secondary p-4 text-left transition hover:drop-shadow-lg lg:p-8"
                onClick={() => router.push(fullUrl(url ?? ''))}
              >
                <div className="flex flex-1 items-center gap-4">
                  <div className="flex h-[80px] w-[80px] flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black lg:h-[100px] lg:w-[100px]">
                    <NextImage
                      alt={cta.title}
                      className="object-cover lg:h-[80px] lg:w-[80px]"
                      height={60}
                      sizes="(max-width: 768px) 60px, 80px"
                      src={imageSrc}
                      width={60}
                    />
                  </div>
                  <div className="block sm:hidden">
                    <div className="mb-1 text-base font-bold lg:text-2xl">{cta.title}</div>
                    <div className="text-sm text-gray-500 lg:text-xl">{cta.title}</div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="mb-1 text-base font-bold lg:text-2xl">{cta.title}</div>
                    <div className="text-sm text-gray-500 lg:text-xl">{cta.title}</div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <ChevronRight className="h-6 w-6 lg:h-8 lg:w-8" />
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
