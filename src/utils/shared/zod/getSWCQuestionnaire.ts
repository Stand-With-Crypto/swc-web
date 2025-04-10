import { z } from 'zod'

export enum QUESTION_ANSWER_OPTIONS {
  YES = 'Yes',
  NO = 'No',
  NOT_ANSWERED = 'Not answered',
  OTHER = 'Other',
}

const zodQuestionnaireAnswerSchema = z.object({
  question: z.string(),
  answer: z.enum([
    QUESTION_ANSWER_OPTIONS.YES,
    QUESTION_ANSWER_OPTIONS.NO,
    QUESTION_ANSWER_OPTIONS.NOT_ANSWERED,
    QUESTION_ANSWER_OPTIONS.OTHER,
  ]),
  otherAnswer: z.string().optional(),
})

export const zodQuestionnaireSchemaValidation = z.object({
  dtsiSlug: z.string(),
  questionnaireUs: z.array(zodQuestionnaireAnswerSchema),
  questionnaireAu: z.array(zodQuestionnaireAnswerSchema),
  questionnaireCa: z.array(zodQuestionnaireAnswerSchema),
  questionnaireGb: z.array(zodQuestionnaireAnswerSchema),
})

export type SWCQuestionnaireEntry = Zod.infer<typeof zodQuestionnaireSchemaValidation>
export type SWCQuestionnaireAnswers = Zod.infer<typeof zodQuestionnaireAnswerSchema>
