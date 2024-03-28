import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { LocationStateSpecific } from '@/components/app/pageLocationStateSpecific'
import { queryDTSILocationStateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationStateSpecificInformation'
import { PageProps } from '@/types'
import { US_LOCATION_PAGES_LIVE } from '@/utils/shared/locationSpecificPages'
import { toBool } from '@/utils/shared/toBool'
import {
  getUSStateNameFromStateCode,
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
} from '@/utils/shared/usStateUtils'
import { zodUsaState } from '@/validation/fields/zodUsaState'

export const dynamic = 'error'
export const dynamicParams = toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)

type LocationStateSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationStateSpecificPageProps): Promise<Metadata> {
  const stateCode = zodUsaState.parse(params.stateCode.toUpperCase())
  const stateName = getUSStateNameFromStateCode(stateCode)

  const title = `See where ${stateName} politicians stand on crypto`
  const description = `We asked ${stateName} politicians for their thoughts on crypto. Here's what they said.`
  return {
    title,
    description,
  }
}

export async function generateStaticParams() {
  return toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)
    ? US_LOCATION_PAGES_LIVE.slice(0, 1).map(state =>
        typeof state === 'string'
          ? { stateCode: state }
          : { stateCode: state.stateCode.toLowerCase() },
      )
    : Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).map(stateCode => ({
        stateCode: stateCode.toLowerCase(),
      }))
}

export default async function LocationStateSpecificPage({
  params,
}: LocationStateSpecificPageProps) {
  const { locale } = params
  const stateCode = zodUsaState.parse(params.stateCode.toUpperCase())
  const data = await queryDTSILocationStateSpecificInformation({ stateCode })

  if (!data) {
    notFound()
  }

  return <LocationStateSpecific {...data} {...{ stateCode, locale }} />
}
