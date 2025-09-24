import { generateObject } from 'ai'
import { Logger } from 'inngest/middleware/logger'
import pRetry from 'p-retry'
import z from 'zod'

import {
  AI_ANALYSIS_BATCH_DELAY_IN_SECONDS,
  AI_ANALYSIS_BATCH_LENGTH,
  AI_ANALYSIS_MAX_RETRIES,
  AI_ANALYSIS_MIN_TIMEOUT,
} from '@/inngest/functions/stateLevelBillsCronJob/config'
import { sleep } from '@/utils/shared/sleep'
import { SWCBillFromBuilderIO } from '@/utils/shared/zod/getSWCBills'

type Bill = Required<Pick<SWCBillFromBuilderIO, 'externalId' | 'summary' | 'title'>>

const cryptoRelatedBillAnalysisSchema = z.object({
  bills: z
    .object({
      id: z.string(),
      score: z.number().min(0).max(100),
    })
    .array(),
})

async function analyzeCryptoRelatedBills(bills: Bill[]) {
  const result = await generateObject({
    maxOutputTokens: 300,
    model: 'gemini-2.5-flash',
    prompt: [
      {
        role: 'system',
        content: `You are a highly skilled legal and technical analyst specializing in cryptocurrency and blockchain technology. Your task is to carefully analyze a list of bills and determine the relevance of each to crypto usage, regulation, or technology.
          
        For each bill in the provided list, you must provide a single numerical score from 0 to 100. A score of 0 means there is no relation, while a score of 100 means the bill is entirely focused on crypto. Your analysis must be meticulous and consider subtle technical and legal language.
          
        Your response MUST be an object containing only one field called "bills" which will contain an array of objects, where each object has the "id" of the analyzed bill and a "score" corresponding to the crypto relevance of the bills. Do NOT include any other text or explanation, only the requested object. Your response MUST NOT include any other information besides the JSON object. Avoid adding additional texts or explanations.`,
      },
      {
        role: 'user',
        content: `Analyze the following list of bills and provide a cryptocurrency relevance score for each. The score should be a number from 0 to 100.
  
          List of bills:
          ${bills
            .map(
              (bill, index) =>
                `${index}: id: ${bill.externalId}, title: "${bill.title}", summary: "${bill.summary}"`,
            )
            .join('\n')}
  
          For each bill, provide a JSON object with the bills list and their corresponding calculated scores. Do NOT include any other text or explanation, only the requested object. Your response MUST NOT include any other information besides the JSON object. Avoid adding additional texts or explanations.`,
      },
    ],
    schema: cryptoRelatedBillAnalysisSchema,
    temperature: 0.1,
  })

  return result.object
}

export async function analyzeCryptoRelatedBillsWithRetry(bills: Bill[], logger: Logger) {
  let offset = 0

  const data: z.infer<typeof cryptoRelatedBillAnalysisSchema>['bills'] = []

  while (offset < bills.length) {
    const batch = bills.slice(offset, offset + AI_ANALYSIS_BATCH_LENGTH)

    try {
      const scores = await pRetry(() => analyzeCryptoRelatedBills(batch), {
        minTimeout: AI_ANALYSIS_MIN_TIMEOUT,
        retries: AI_ANALYSIS_MAX_RETRIES,
      })

      data.push(...scores.bills)
    } catch (error) {
      logger.error(
        `Failed to analyze bills data.\nids: ${batch.map(bill => bill.externalId).join(', ')}.\nerror: ${error instanceof Error ? error.message : String(error)}`,
      )
      throw error
    }

    offset += AI_ANALYSIS_BATCH_LENGTH

    if (offset < bills.length) {
      await sleep(AI_ANALYSIS_BATCH_DELAY_IN_SECONDS * 1_000)
    }
  }

  return data
}
