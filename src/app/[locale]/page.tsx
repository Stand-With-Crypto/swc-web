import { notFound } from 'next/navigation'

import { PageHome } from '@/components/app/pageHome'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { PageProps } from '@/types'
import { BuilderSectionModelIdentifiers } from '@/utils/server/builder/models/sections/constants'
import { getSectionContent } from '@/utils/server/builder/models/sections/utils/getSectionContent'
import { ORDERED_SUPPORTED_LOCALES } from '@/utils/shared/supportedLocales'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

export default async function Home(props: PageProps) {
  const params = await props.params
  const asyncProps = await getHomepageData({
    recentActivityLimit: 30,
    restrictToUS: true,
  })
  const advocatePerStateDataProps = await getAdvocatesMapData()
  const homeHeroContent = await getSectionContent(BuilderSectionModelIdentifiers.HERO, '/')

  /*
  the locale check in layout works for most cases, but for some reason if we hit
  a path that includes a "." like /requestProvider.js.map nextjs will try to render the page with that as the locality
  Adding this check here fixes that issue
  */
  if (!ORDERED_SUPPORTED_LOCALES.includes(params.locale)) {
    notFound()
  }

  return (
    <PageHome
      advocatePerStateDataProps={advocatePerStateDataProps}
      homeHeroContent={homeHeroContent}
      params={params}
      {...asyncProps}
    />
  )
}
