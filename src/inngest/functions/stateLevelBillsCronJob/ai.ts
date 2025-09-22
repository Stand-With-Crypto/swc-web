import { generateObject } from 'ai'
import pRetry from 'p-retry'
import z from 'zod'

import {
  AI_ANALYSIS_BATCH_LENGTH,
  AI_ANALYSIS_MAX_RETRIES,
} from '@/inngest/functions/stateLevelBillsCronJob/config'
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
    model: 'openai/gpt-4o',
    prompt: [
      {
        role: 'system',
        content: `You are a highly skilled legal and technical analyst specializing in cryptocurrency and blockchain technology. Your task is to carefully analyze a list of bills and determine the relevance of each to crypto usage, regulation, or technology.
          
          For each bill in the provided list, you must provide a single numerical score from 0 to 100. A score of 0 means there is no relation, while a score of 100 means the bill is entirely focused on crypto. Your analysis must be meticulous and consider subtle technical and legal language.
          
          Your response MUST be a JSON array of objects, where each object has the "id" of the bill and a "score" corresponding to the input bill. Do not include any other text or explanation.`,
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
  
          For each bill, provide a JSON object with its id and the calculated score.`,
      },
    ],
    schema: cryptoRelatedBillAnalysisSchema,
    seed: 1,
    temperature: 0.1,
  })

  return result.object
}

export async function analyzeCryptoRelatedBillsWithRetry(bills: Bill[]) {
  let offset = 0

  const data: z.infer<typeof cryptoRelatedBillAnalysisSchema>['bills'] = []

  while (offset < bills.length) {
    const batch = bills.slice(offset, offset + AI_ANALYSIS_BATCH_LENGTH)

    try {
      const scores = await pRetry(() => analyzeCryptoRelatedBills(batch), {
        minTimeout: 3_000,
        retries: AI_ANALYSIS_MAX_RETRIES,
      })

      data.push(...scores.bills)
    } catch {}

    offset += AI_ANALYSIS_BATCH_LENGTH

    await new Promise(resolve => setTimeout(resolve, 1 * 60 * 1_000))
  }

  return data
}
