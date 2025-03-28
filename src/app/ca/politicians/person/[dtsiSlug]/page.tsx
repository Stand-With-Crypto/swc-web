import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CaPagePoliticianDetails } from '@/components/app/pagePoliticianDetails/ca'
import { getPoliticianDetailsData } from '@/components/app/pagePoliticianDetails/common/getData'
import { getPoliticianDetailsPageDescription } from '@/components/app/pagePoliticianDetails/common/getPoliticianDetailsPageDescription'
import { queryDTSIAllPeopleSlugs } from '@/data/dtsi/queries/queryDTSIAllPeopleSlugs'
import { PageProps } from '@/types'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { toBool } from '@/utils/shared/toBool'

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

export default async function CaPoliticianDetails(props: Props) {
  const { dtsiSlug } = await props.params
  const [person] = await Promise.all([
    getPoliticianDetailsData(dtsiSlug),
    // TODO: uncomment this once we have questionnaire data for AU
    // getQuestionnaire(dtsiSlug),
  ])

  if (!person) {
    notFound()
  }

  return <CaPagePoliticianDetails person={person} />
}
