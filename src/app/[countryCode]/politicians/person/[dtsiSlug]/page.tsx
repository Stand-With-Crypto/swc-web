import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { queryDTSIAllPeopleSlugs } from '@/data/dtsi/queries/queryDTSIAllPeopleSlugs'
import { PageProps } from '@/types'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { getQuestionnaire } from '@/utils/server/builder/models/data/questionnaire'
import { toBool } from '@/utils/shared/toBool'

import { getPoliticianDetailsPageDescription } from '@/components/app/pagePoliticianDetails/common/getPoliticianDetailsPageDescription'
import { UsPagePoliticianDetails } from '@/components/app/pagePoliticianDetails/us'
import { getPoliticianDetailsData } from '@/components/app/pagePoliticianDetails/common/getData'

export const revalidate = 86400 // 1 day
export const dynamic = 'error'
export const dynamicParams = true

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
  const slugs = await queryDTSIAllPeopleSlugs().then(x =>
    x.people.map(({ slug: dtsiSlug }) => ({ dtsiSlug })),
  )
  if (toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)) {
    return slugs.slice(0, 2)
  }
  return slugs
}

export default async function PoliticianDetails(props: Props) {
  const params = await props.params
  const { countryCode } = params

  const [person, questionnaire] = await Promise.all([
    getPoliticianDetailsData(params.dtsiSlug),
    getQuestionnaire(params.dtsiSlug),
  ])

  if (!person) {
    notFound()
  }

  return <UsPagePoliticianDetails {...{ person, countryCode, questionnaire }} />
}
