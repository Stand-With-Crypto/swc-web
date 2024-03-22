import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { LocationStateSpecific } from '@/components/app/pageLocationStateSpecific'
import { queryDTSIStateSpecificInformation } from '@/data/dtsi/queries/queryDTSIStateSpecificInformation'
import { PageProps } from '@/types'
import { US_LOCATION_PAGES_LIVE } from '@/utils/shared/locationSpecificPages'
import { toBool } from '@/utils/shared/toBool'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

export const dynamic = 'error'
export const dynamicParams = toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)

type LocationStateSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationStateSpecificPageProps): Promise<Metadata> {
  const title = LocationStateSpecific.getTitle(params)
  const description = LocationStateSpecific.getDescription(params)
  return {
    title,
    description,
  }
}

export async function generateStaticParams() {
  return toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)
    ? US_LOCATION_PAGES_LIVE.slice(0, 1).map(state =>
        typeof state === 'string' ? { stateCode: state } : { stateCode: state.stateCode },
      )
    : Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).map(stateCode => ({
        stateCode,
      }))
}

export default async function LocationStateSpecificPage({
  params,
}: LocationStateSpecificPageProps) {
  const { stateCode, locale } = params

  const data = await queryDTSIStateSpecificInformation({ stateCode })

  if (!data) {
    notFound()
  }

  return <LocationStateSpecific {...data} {...{ stateCode, locale }} />
}
