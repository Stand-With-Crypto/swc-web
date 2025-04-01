import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getPoliticianDetailsData } from '@/components/app/pagePoliticianDetails/common/getData'
import { getPoliticianDetailsPageDescription } from '@/components/app/pagePoliticianDetails/common/getPoliticianDetailsPageDescription'
import { GbPagePoliticianDetails } from '@/components/app/pagePoliticianDetails/gb'
import { queryDTSIAllPeopleSlugs } from '@/data/dtsi/queries/queryDTSIAllPeopleSlugs'
import { PageProps } from '@/types'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { getQuestionnaire } from '@/utils/server/builder/models/data/questionnaire'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { toBool } from '@/utils/shared/toBool'

export const revalidate = 86400 // 1 day
export const dynamic = 'error'
export const dynamicParams = true
const countryCode = SupportedCountryCodes.GB

type Props = PageProps<{ dtsiSlug: string }>

export async function generateMetadata(props: Props): Promise<Metadata> {
  const person = await getPoliticianDetailsData((await props.params).dtsiSlug)
  if (!person) {
    return {}
  }
  const title = `${dtsiPersonFullName(person)} Crypto Policy Stance`
  return {
    title,
    description: getPoliticianDetailsPageDescription(person),
  }
}
export async function generateStaticParams() {
  const slugs = await queryDTSIAllPeopleSlugs({ countryCode }).then(x =>
    x.people.map(({ slug: dtsiSlug }) => ({ dtsiSlug })),
  )
  if (toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)) {
    return slugs.slice(0, 2)
  }
  return slugs
}

export default async function GbPoliticianDetails(props: Props) {
  const { dtsiSlug } = await props.params
  const [person, questionnaire] = await Promise.all([
    getPoliticianDetailsData(dtsiSlug),
    getQuestionnaire({
      countryCode,
      dtsiSlug,
    }),
  ])

  if (!person) {
    notFound()
  }

  return <GbPagePoliticianDetails person={person} questionnaire={questionnaire} />
}
