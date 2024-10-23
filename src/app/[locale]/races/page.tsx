import { Metadata } from 'next'

import { LocationUnitedStatesLiveResults } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults'
import { getKeyRacesPageData } from '@/data/pageSpecific/getKeyRacesPageData'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { toBool } from '@/utils/shared/toBool'

export const dynamic = 'error'
export const dynamicParams = toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)
export const revalidate = SECONDS_DURATION['MINUTE']

type LocationUnitedStatesPageProps = PageProps

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Who will defend crypto in America?'
  const description = 'View live election results on Stand With Crypto.'

  return {
    title,
    description,
    // openGraph: {
    //   title,
    //   description,
    //   siteName: 'Stand With Crypto',
    //   locale: 'en_US',
    //   type: 'website',
    // },
    twitter: {
      title,
      description,
      card: 'summary_large_image',
      creator: '@standwithcrypto',
    },
  } satisfies Metadata
}

export default async function LocationUnitedStatesPage({ params }: LocationUnitedStatesPageProps) {
  const { locale } = params

  const data = await getKeyRacesPageData()

  return <LocationUnitedStatesLiveResults locale={locale} {...data} />
}
