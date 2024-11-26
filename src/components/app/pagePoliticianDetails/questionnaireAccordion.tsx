'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useUrlHash } from '@/hooks/useUrlHash'
import {
  QUESTION_ANSWER_OPTIONS,
  SWCQuestionnaireAnswers,
} from '@/utils/shared/getSWCQuestionnaire'
import { twNoop } from '@/utils/web/cn'

interface QuestionnaireAccordionProps {
  questionnaire: SWCQuestionnaireAnswers
}

export const QUESTIONNAIRE_HASH_KEY = 'questionnaire'

export function QuestionnaireAccordion({ questionnaire }: QuestionnaireAccordionProps) {
  const [accordionValue, setAccordionValue] = useState('')
  const urlHash = useUrlHash()
  const questionnaireRef = useRef<HTMLDivElement>(null)

  const answersAmount = useMemo(() => {
    const totalAnsweredFields = Object.entries(questionnaire?.data ?? {}).reduce(
      (acc, [key, value]) => {
        if (key === 'q8ShareAnyOtherOpinionsOnCrypto' && value.length > 0) return (acc += 1)

        return value !== QUESTION_ANSWER_OPTIONS['Not answered'] ? (acc += 1) : acc
      },
      0,
    )

    // subtracting one because dtsiSlug is returned inside data and it doesn't represent an answer
    return totalAnsweredFields - 1
  }, [questionnaire.data])

  useEffect(() => {
    if (!questionnaireRef.current || !urlHash) return
    questionnaireRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [questionnaireRef, urlHash])

  useEffect(() => {
    setAccordionValue(urlHash === QUESTIONNAIRE_HASH_KEY ? QUESTIONNAIRE_HASH_KEY : '')
  }, [urlHash])

  if (answersAmount === -1) return null

  return (
    <div className="mb-10 flex scroll-mt-20 flex-col" ref={questionnaireRef}>
      <PageTitle as="h2" className="mb-4 text-center text-lg md:text-xl lg:text-2xl" size="sm">
        Candidate questionnaire
      </PageTitle>

      <Accordion collapsible onValueChange={setAccordionValue} type="single" value={accordionValue}>
        <AccordionItem value="questionnaire">
          <AccordionTrigger data-testid="questionnaire-trigger">
            Responses ({answersAmount})
          </AccordionTrigger>

          <AccordionContent className="pb-0">
            <div className="px-6 last:*:border-none">
              <QuestionnaireItem
                answer={questionnaire.data?.q1ExperienceUsingBlockchainTechnology}
                question="Do you have experience buying, selling, or using blockchain technology assets or investment tools?"
              />

              <QuestionnaireItem
                answer={questionnaire.data?.q2BlockchainWillPlayMajorRoleNextInnoWave}
                question="Do you believe blockchain technology and digital assets, including cryptocurrency like Bitcoin, will play a major role in the next wave of technological innovation globally?"
              />

              <QuestionnaireItem
                answer={questionnaire.data?.q3AmerCryptoIsDrivingEconomicGrowth}
                question="Do you believe the American cryptocurrency and digital asset industry is driving economic growth and supporting millions of jobs across the country?"
              />

              <QuestionnaireItem
                answer={questionnaire.data?.q4UsCompAtRiskIfDigitalAssetsPushedOverse}
                question="Do you believe US competitiveness and American national security are at risk if the digital asset industry is pushed overseas?"
              />

              <QuestionnaireItem
                answer={questionnaire.data?.q5UsModernizeRegulatoryEnvironmentForCrypto}
                question="Do you believe it is important for the United States to modernize the regulatory environment for crypto and digital assets to ensure proper consumer protection while also fostering responsible innovation?"
              />

              <QuestionnaireItem
                answer={questionnaire.data?.q6WouldYouVoteInFavorOfLegislation}
                question="If you are currently a Member of Congress or are elected to Congress, would you vote in favor of legislation that creates a comprehensive regulatory framework for digital assets like HR 4763, the “Financial Innovation and Technology for the 21st Century Act”, a bipartisan bill?"
              />

              <QuestionnaireItem
                answer={questionnaire.data?.q7VoteInFavorOfLegisToPaymentStablecoins}
                question="If you are currently a Member of Congress or are elected to Congress, would you vote in favor of legislation to create clear rules for payment stablecoins (i.e., digital assets that are redeemable for U.S. dollars 1:1) like HR 4766, “Clarity for Payment Stablecoins Act of 2023”, a bipartisan bill?"
              />

              <QuestionnaireItem
                answer={questionnaire.data?.q8ShareAnyOtherOpinionsOnCrypto ?? ''}
                isBooleanQuestion={false}
                question="Please share any other positions or opinions that you have on how crypto and digital assets should be regulated?"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

interface QuestionnaireItemProps {
  question: string
  answer: QUESTION_ANSWER_OPTIONS | string
  isBooleanQuestion?: boolean
}

function QuestionnaireItem({ answer, question, isBooleanQuestion = true }: QuestionnaireItemProps) {
  function getAnswerStyles() {
    if (!isBooleanQuestion || answer === QUESTION_ANSWER_OPTIONS['Not answered']) {
      return ''
    }

    return answer === QUESTION_ANSWER_OPTIONS['Yes']
      ? twNoop('text-green-600')
      : twNoop('text-red-600')
  }

  function getAnswer() {
    if (!isBooleanQuestion) return !answer?.length ? 'Not answered' : answer

    if (isBooleanQuestion && answer === QUESTION_ANSWER_OPTIONS['Not answered']) {
      return 'Not answered'
    }

    return answer === QUESTION_ANSWER_OPTIONS['Yes'] ? 'Yes' : 'No'
  }

  return (
    <div className="last-of-type:div:bg-red-500 flex flex-col gap-4 border-b-[1px] border-[#5B616E33]  py-6 text-base text-fontcolor-muted">
      <p>
        <strong className="text-foreground">Q: </strong>
        {question}
      </p>
      <strong className={getAnswerStyles()}>A: {getAnswer()}</strong>
    </div>
  )
}
