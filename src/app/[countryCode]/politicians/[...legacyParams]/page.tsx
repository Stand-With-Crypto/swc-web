import * as Sentry from '@sentry/nextjs'
import { permanentRedirect } from 'next/navigation'

import _legacyPoliticianToDTSIMap from '@/staticContent/dtsi/legacyPoliticianToDTSIMap.json'
import { PageProps } from '@/types'
import { getIntlUrls } from '@/utils/shared/urls'

export const revalidate = 604800 // 1 week
export const dynamic = 'error'
export const dynamicParams = true

const legacyPoliticianToDTSIMap: Record<string, string> = _legacyPoliticianToDTSIMap
type Props = PageProps<{ legacyParams: string[] }>

export default async function LegacyPoliticianDetails(props: Props) {
  const params = await props.params
  const { legacyParams, countryCode } = params
  const intlUrls = getIntlUrls(countryCode)
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
