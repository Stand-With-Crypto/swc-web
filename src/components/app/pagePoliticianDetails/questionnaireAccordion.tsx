'use client'

import { useEffect, useRef } from 'react'
import { isNil } from 'lodash-es'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useUrlHash } from '@/hooks/useUrlHash'
import { SWCQuestionnaireAnswers } from '@/utils/server/builderIO/swc-questionnaire'
import { twNoop } from '@/utils/web/cn'

interface QuestionnaireAccordionProps {
  questionnaire: SWCQuestionnaireAnswers | null
}

const QUESTIONNAIRE_HASH_KEY = 'questionnaire'

export function QuestionnaireAccordion({ questionnaire }: QuestionnaireAccordionProps) {
  const { urlHash } = useUrlHash()
  const accordionDefaultValue =
    urlHash === QUESTIONNAIRE_HASH_KEY ? QUESTIONNAIRE_HASH_KEY : isNil(urlHash) ? null : ''
  const questionnaireRef = useRef<HTMLDivElement>(null)
  const answersAmount = Object.keys(questionnaire?.data ?? {}).length - 1
  useEffect(() => {
    if (!questionnaireRef.current || !accordionDefaultValue) return
    questionnaireRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [questionnaireRef, accordionDefaultValue])

  if (!questionnaire || isNil(accordionDefaultValue)) return null

  return (
    <div className="mb-10 flex scroll-mt-20 flex-col" id="questionnaire" ref={questionnaireRef}>
      <PageTitle as="h2" className="mb-4 text-center text-lg md:text-xl lg:text-2xl" size="sm">
        Candidate questionnaire
      </PageTitle>

      <Accordion collapsible defaultValue={accordionDefaultValue} type="single">
        <AccordionItem value="questionnaire">
          <AccordionTrigger>Responses ({answersAmount})</AccordionTrigger>

          <AccordionContent className="pb-0">
            <div className="px-6 last:*:border-none">
              {!isNil(questionnaire.data?.q1ExperienceUsingBlockchainTechnology) && (
                <QuestionnaireItem
                  answer={questionnaire.data?.q1ExperienceUsingBlockchainTechnology}
                  question="Do you have experience buying, selling, or using blockchain technology assets or investment tools?"
                />
              )}
              {!isNil(questionnaire.data?.q2BlockchainWillPlayMajorRoleNextInnoWave) && (
                <QuestionnaireItem
                  answer={questionnaire.data?.q2BlockchainWillPlayMajorRoleNextInnoWave}
                  question="Do you believe blockchain technology and digital assets, including cryptocurrency like Bitcoin, will play a major role in the next wave of technological innovation globally?"
                />
              )}

              {!isNil(questionnaire.data?.q3AmerCryptoIsDrivingEconomicGrowth) && (
                <QuestionnaireItem
                  answer={questionnaire.data?.q3AmerCryptoIsDrivingEconomicGrowth}
                  question="Do you believe the American cryptocurrency and digital asset industry is driving economic growth and supporting millions of jobs across the country?"
                />
              )}

              {!isNil(questionnaire.data?.q4UsCompAtRiskIfDigitalAssetsPushedOverse) && (
                <QuestionnaireItem
                  answer={questionnaire.data?.q4UsCompAtRiskIfDigitalAssetsPushedOverse}
                  question="Do you believe US competitiveness and American national security are at risk if the digital asset industry is pushed overseas?"
                />
              )}

              {!isNil(questionnaire.data?.q5UsModernizeRegulatoryEnvironmentForCrypto) && (
                <QuestionnaireItem
                  answer={questionnaire.data?.q5UsModernizeRegulatoryEnvironmentForCrypto}
                  question="Do you believe it is important for the United States to modernize the regulatory environment for crypto and digital assets to ensure proper consumer protection while also fostering responsible innovation?"
                />
              )}

              {!isNil(questionnaire.data?.q6WouldYouVoteInFavorOfLegislation) && (
                <QuestionnaireItem
                  answer={questionnaire.data?.q6WouldYouVoteInFavorOfLegislation}
                  question="If you are currently a Member of Congress or are elected to Congress, would you vote in favor of legislation that creates a comprehensive regulatory framework for digital assets like HR 4763, the “Financial Innovation and Technology for the 21st Century Act”, a bipartisan bill?"
                />
              )}

              {!isNil(questionnaire.data?.q7VoteInFavorOfLegisToPaymentStablecoins) && (
                <QuestionnaireItem
                  answer={questionnaire.data?.q7VoteInFavorOfLegisToPaymentStablecoins}
                  question="If you are currently a Member of Congress or are elected to Congress, would you vote in favor of legislation to create clear rules for payment stablecoins (i.e., digital assets that are redeemable for U.S. dollars 1:1) like HR 4766, “Clarity for Payment Stablecoins Act of 2023”, a bipartisan bill?"
                />
              )}

              {!isNil(questionnaire.data?.q8ShareAnyOtherOpinionsOnCrypto) && (
                <QuestionnaireItem
                  answer={questionnaire.data?.q8ShareAnyOtherOpinionsOnCrypto}
                  isBooleanQuestion={false}
                  question="Please share any other positions or opinions that you have on how crypto and digital assets should be regulated?"
                />
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

interface QuestionnaireItemProps {
  question: string
  answer: boolean | string
  isBooleanQuestion?: boolean
}

function QuestionnaireItem({ answer, question, isBooleanQuestion = true }: QuestionnaireItemProps) {
  const parsedAnswer = !isBooleanQuestion ? answer : answer === true ? 'Yes' : 'No'

  function getAnswerStyles() {
    if (!isBooleanQuestion) return ''

    return answer ? twNoop('text-green-600') : twNoop('text-red-600')
  }

  return (
    <div className="last-of-type:div:bg-red-500 flex flex-col gap-4 border-b-[1px] border-[#5B616E33]  py-6 text-base text-fontcolor-muted">
      <p>
        <strong className="text-foreground">Q: </strong>
        {question}
      </p>
      <strong className={getAnswerStyles()}>A: {parsedAnswer}</strong>
    </div>
  )
}
