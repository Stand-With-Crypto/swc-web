import { Entry } from 'contentful'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PagePoliticianDetails } from '@/components/app/pagePoliticianDetails'
import { queryDTSIAllPeopleSlugs } from '@/data/dtsi/queries/queryDTSIAllPeopleSlugs'
import { DTSIPersonDetails } from '@/data/dtsi/queries/queryDTSIPersonDetails'
import { PageProps } from '@/types'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import {
  convertDTSIPersonStanceScoreToLetterGrade,
  DTSILetterGrade,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import {
  getQuestionnaire,
  QuestionnaireEntrySkeleton,
} from '@/utils/server/contentful/questionnaire'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { toBool } from '@/utils/shared/toBool'

import { getData } from './getData'
import { getQuestionnaire } from '@/utils/server/contentful/questionnaire'

export const revalidate = SECONDS_DURATION.WEEK
export const dynamic = 'error'
export const dynamicParams = true

type Props = PageProps<{ dtsiSlug: string }>

const getDescription = (person: DTSIPersonDetails) => {
  const fullName = dtsiPersonFullName(person)
  if (!person.stances.length) {
    return `${fullName} has not made any recent comments about Bitcoin, Ethereum, and cryptocurrency innovation.`
  }
  const indication = (() => {
    switch (convertDTSIPersonStanceScoreToLetterGrade(person)) {
      case DTSILetterGrade.A:
        return 'indicated they are very pro-cryptocurrencies'
      case DTSILetterGrade.B:
        return 'indicated thy are somewhat pro-cryptocurrencies'
      case DTSILetterGrade.C:
      case null:
        return 'not indicated whether they are for or against cryptocurrencies.'
      case DTSILetterGrade.D:
        return 'indicated they are somewhat anti-cryptocurrencies'
      case DTSILetterGrade.F:
        return 'indicated they are very anti-cryptocurrencies'
    }
  })()
  return `Based on previous comments, ${fullName} has ${indication}. On this page you can view the tweets, quotes, and other commentary ${fullName} has made about Bitcoin, Ethereum, and cryptocurrency innovation.`
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const person = await getData(props.params.dtsiSlug)
  if (!person) {
    return {}
  }
  const title = `${dtsiPersonFullName(person)} Crypto Policy Stance`
  return {
    title,
    description: getDescription(person),
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

export default async function PoliticianDetails({ params }: Props) {
  const { locale } = params
  const person = await getData(params.dtsiSlug)
  if (!person) {
    notFound()
  }
  const tempQuestionnaire: Entry<QuestionnaireEntrySkeleton, undefined> = {
    contentTypeId: 'swcQuestionnaire',
    fields: {
      slug: 'cynthia---lummis',
      q1ExperienceUsingBlockchainTechnology: true,
      q2BlockchainWillPlayMajorRoleNextInnoWave: false,
      q3AmerCryptoIsDrivingEconomicGrowth: true,
      q4UsCompAtRiskIfDigitalAssetsPushedOverse: false,
      q5UsModernizeRegulatoryEnvironmentForCrypto: true,
      q6WouldYouVoteInFavorOfLegislation: true,
      q7VoteInFavorOfLegisToPaymentStablecoins: false,
      q8ShareAnyOtherOpinionsOnCrypto: 'loremawdawdawd',
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: 'c5bd0wqjc7v0',
        },
      },
      id: 'swcQuestionnaire',
      type: 'Entry',
      createdAt: '2024-03-28T22:30:39.817Z',
      updatedAt: '2024-04-23T16:48:37.559Z',
      environment: {
        sys: {
          id: 'dev',
          type: 'Link',
          linkType: 'Environment',
        },
      },
    },
  }

  return <PagePoliticianDetails {...{ person, locale, questionnaire: tempQuestionnaire }} />
}
