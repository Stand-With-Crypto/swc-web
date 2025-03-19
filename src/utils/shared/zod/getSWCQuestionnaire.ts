import { nativeEnum, object, string } from 'zod'

export enum QUESTION_ANSWER_OPTIONS {
  'Yes' = 'Yes',
  'No' = 'No',
  'Not answered' = 'Not answered',
}

export const zodQuestionnaireSchemaValidation = object({
  data: object({
    dtsiSlug: string(),
    q1ExperienceUsingBlockchainTechnology: nativeEnum(QUESTION_ANSWER_OPTIONS),
    q2BlockchainWillPlayMajorRoleNextInnoWave: nativeEnum(QUESTION_ANSWER_OPTIONS),
    q3AmerCryptoIsDrivingEconomicGrowth: nativeEnum(QUESTION_ANSWER_OPTIONS),
    q4UsCompAtRiskIfDigitalAssetsPushedOverse: nativeEnum(QUESTION_ANSWER_OPTIONS),
    q5UsModernizeRegulatoryEnvironmentForCrypto: nativeEnum(QUESTION_ANSWER_OPTIONS),
    q6WouldYouVoteInFavorOfLegislation: nativeEnum(QUESTION_ANSWER_OPTIONS),
    q7VoteInFavorOfLegisToPaymentStablecoins: nativeEnum(QUESTION_ANSWER_OPTIONS),
    q8ShareAnyOtherOpinionsOnCrypto: string().optional(),
  }),
  published: string().regex(/^published$/),
})

export type SWCQuestionnaireAnswers = Zod.infer<typeof zodQuestionnaireSchemaValidation>
