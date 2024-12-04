import { Metadata } from 'next'

import { LocationUnitedStatesLiveResults } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults'
import { getKeyRacesPageData } from '@/data/pageSpecific/getKeyRacesPageData'
import { PageProps } from '@/types'

export const revalidate = 900 // 15 minutes
export const dynamic = 'error'
export const dynamicParams = false

type LocationUnitedStatesPageProps = PageProps

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Who will defend crypto in America?'
  const description = 'View live election results on Stand With Crypto.'

  return {
    title,
    description,
  }
}

export default async function LocationUnitedStatesPage(props: LocationUnitedStatesPageProps) {
  const params = await props.params
  const { locale } = params

  const data = await getKeyRacesPageData()

  return <LocationUnitedStatesLiveResults locale={locale} {...data} />
}
