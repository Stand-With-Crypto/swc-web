'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { QUESTIONNAIRE_HASH_KEY } from '@/components/app/pagePoliticianDetails/common/constants'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useUrlHash } from '@/hooks/useUrlHash'
import { type NormalizedQuestionnaire } from '@/utils/server/builder/models/data/questionnaire'
import { QUESTION_ANSWER_OPTIONS } from '@/utils/shared/zod/getSWCQuestionnaire'

interface QuestionnaireAccordionProps {
  questionnaire: NormalizedQuestionnaire
}

export function QuestionnaireAccordion({ questionnaire }: QuestionnaireAccordionProps) {
  const [accordionValue, setAccordionValue] = useState('')
  const urlHash = useUrlHash()
  const questionnaireRef = useRef<HTMLDivElement>(null)

  const answersAmount = useMemo(() => {
    return questionnaire?.questions.reduce((acc, question) => {
      if (
        question.answer === QUESTION_ANSWER_OPTIONS.OTHER &&
        question.otherAnswer &&
        question.otherAnswer.length > 0
      ) {
        return acc + 1
      }

      return [QUESTION_ANSWER_OPTIONS.YES, QUESTION_ANSWER_OPTIONS.NO].includes(question.answer)
        ? acc + 1
        : acc
    }, 0)
  }, [questionnaire])

  useEffect(() => {
    if (!questionnaireRef.current || !urlHash) return
    questionnaireRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [questionnaireRef, urlHash])

  useEffect(() => {
    setAccordionValue(urlHash === QUESTIONNAIRE_HASH_KEY ? QUESTIONNAIRE_HASH_KEY : '')
  }, [urlHash])

  if (answersAmount === 0) return null

  return (
    <div className="mb-10 flex scroll-mt-20 flex-col" ref={questionnaireRef}>
      <PageTitle as="h2" className="mb-4 text-center text-lg md:text-xl lg:text-2xl" size="md">
        Candidate questionnaire
      </PageTitle>

      <Accordion collapsible onValueChange={setAccordionValue} type="single" value={accordionValue}>
        <AccordionItem value="questionnaire">
          <AccordionTrigger data-testid="questionnaire-trigger">
            Responses ({answersAmount})
          </AccordionTrigger>

          <AccordionContent className="pb-0">
            <div className="px-6 last:*:border-none">
              {questionnaire.questions.map(({ answer, question, otherAnswer }, index) => {
                return (
                  <QuestionnaireItem
                    answer={
                      answer === QUESTION_ANSWER_OPTIONS.OTHER
                        ? (otherAnswer ?? QUESTION_ANSWER_OPTIONS.NOT_ANSWERED)
                        : answer
                    }
                    key={`${question}-${index}`}
                    question={question}
                  />
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

function QuestionnaireItem({ answer, question }: { answer: string; question: string }) {
  function getAnswerStyles() {
    if (answer === QUESTION_ANSWER_OPTIONS.YES) {
      return 'text-green-600'
    }

    if (answer === QUESTION_ANSWER_OPTIONS.NO) {
      return 'text-red-600'
    }

    return ''
  }

  return (
    <div className="last-of-type:div:bg-red-500 flex flex-col gap-4 border-b-[1px] border-[#5B616E33]  py-6 text-base text-fontcolor-muted">
      <p>
        <strong className="text-foreground">Q: </strong>
        {question}
      </p>
      <strong className={getAnswerStyles()}>A: {answer}</strong>
    </div>
  )
}
