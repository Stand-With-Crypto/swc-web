import { Metadata } from 'next'
import { string } from 'zod'

import { MOCK_PRESS_CONTENT } from '@/app/[locale]/press/mock'
import { PagePressContent } from '@/components/app/pagePress/content'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { toBool } from '@/utils/shared/toBool'

export const dynamic = 'error'
export const dynamicParams = toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)
export const revalidate = SECONDS_DURATION['10_MINUTES']

type PressContentPageProps = PageProps<{
  pressSlug: string
}>

export const zodPressSlug = string()

export async function generateMetadata({ params }: PressContentPageProps): Promise<Metadata> {
  const pressSlug = zodPressSlug.parse(params.pressSlug.toLowerCase())
  const pressContent = (await new Promise(resolve => {
    setTimeout(() => {
      resolve(MOCK_PRESS_CONTENT.find(content => content.slug.toLowerCase() === pressSlug))
    }, 1000)
  })) as unknown as (typeof MOCK_PRESS_CONTENT)[0]

  const title = `Read more about - ${pressContent.heading}`
  const description = `Press news on Stand With.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function PressContentPage({ params }: PressContentPageProps) {
  const pressSlug = zodPressSlug.parse(params.pressSlug.toLowerCase())

  if (!pressSlug) {
    throw new Error(`Invalid params for PressContentPage: ${JSON.stringify(params)}`)
  }

  const pressContent = await new Promise(resolve => {
    setTimeout(() => {
      resolve(MOCK_PRESS_CONTENT.find(content => content.slug.toLowerCase() === pressSlug))
    }, 1000)
  })

  if (!pressContent) {
    throw new Error(`Invalid press content for slug: ${pressSlug}`)
  }

  return <PagePressContent pressContent={pressContent as (typeof MOCK_PRESS_CONTENT)[0]} />
}
