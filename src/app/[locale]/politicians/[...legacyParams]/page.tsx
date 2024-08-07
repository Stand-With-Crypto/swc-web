import * as Sentry from '@sentry/nextjs'
import { permanentRedirect } from 'next/navigation'

import _legacyPoliticianToDTSIMap from '@/staticContent/dtsi/legacyPoliticianToDTSIMap.json'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { getIntlUrls } from '@/utils/shared/urls'

const legacyPoliticianToDTSIMap: Record<string, string> = _legacyPoliticianToDTSIMap
export const revalidate = SECONDS_DURATION.WEEK
export const dynamic = 'error'
export const dynamicParams = true

type Props = PageProps<{ legacyParams: string[] }>

export default async function LegacyPoliticianDetails({ params }: Props) {
  const { legacyParams, locale } = params
  const intlUrls = getIntlUrls(locale)
  const maybeLegacySlug = legacyParams[legacyParams.length - 1]
  const maybeDTSISlug = legacyPoliticianToDTSIMap[maybeLegacySlug]
  if (!maybeDTSISlug) {
    Sentry.captureMessage(`Unexpected legacy politician url`, {
      tags: { legacyParams: legacyParams.join('/') },
    })
    permanentRedirect(intlUrls.politiciansHomepage())
  }
  permanentRedirect(intlUrls.politicianDetails(maybeDTSISlug))
}
