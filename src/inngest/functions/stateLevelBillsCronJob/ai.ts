import { generateObject } from 'ai'
import { Logger } from 'inngest/middleware/logger'
import pRetry from 'p-retry'
import z from 'zod'

import {
  AI_ANALYSIS_BATCH_DELAY_IN_SECONDS,
  AI_ANALYSIS_BATCH_LENGTH,
  AI_ANALYSIS_MAX_OUTPUT_TOKENS,
  AI_ANALYSIS_MAX_RETRIES,
  AI_ANALYSIS_MIN_TIMEOUT,
  AI_ANALYSIS_TEMPERATURE,
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

type CryptoRelatedBillAnalysisSchemaType = z.infer<typeof cryptoRelatedBillAnalysisSchema>

async function analyzeCryptoRelatedBills(bills: Bill[]) {
  const result = await generateObject({
    maxOutputTokens: AI_ANALYSIS_MAX_OUTPUT_TOKENS,
    model: 'gemini-2.5-flash',
    prompt: [
      {
        role: 'system',
        content: `You are a highly skilled legal and technical analyst specializing in cryptocurrency and blockchain technology. Your task is to carefully analyze a list of bills and determine the relevance of each to crypto usage, regulation, or technology.
        
        For each bill, assign a single numerical score from 0 to 100, where 0 means no relation and 100 means the bill is entirely focused on crypto.
        
        Your analysis must be meticulous, considering subtle technical and legal language.

        Output a single JSON object. The object MUST contain one field, "bills", which is an array of objects. Each object in the array MUST have two fields: the "id" of the analyzed bill and a "score" corresponding to its crypto relevance. Do NOT include any other text or explanation.`,
      },
      {
        role: 'user',
        content: `Analyze the following bills and provide a cryptocurrency relevance score from 0 to 100 for each.
        
        Bills:
          ${bills
            .map(
              (bill, index) =>
                `${index}: id: "${bill.externalId}", title: "${bill.title}", summary: "${bill.summary}"`,
            )
            .join('\n')}
  
        Your response MUST be a single JSON object. This object should contain one field, bills, which is an array of objects. Each object in the array MUST have the bill's id and its calculated score. Do NOT include any other text or explanation.`,
      },
    ],
    schema: cryptoRelatedBillAnalysisSchema,
    temperature: AI_ANALYSIS_TEMPERATURE,
  })

  return result.object
}

export async function analyzeCryptoRelatedBillsWithRetry(bills: Bill[], logger: Logger) {
  let offset = 0

  const data: CryptoRelatedBillAnalysisSchemaType['bills'] = []

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
    }

    offset += AI_ANALYSIS_BATCH_LENGTH

    if (offset < bills.length) {
      await sleep(AI_ANALYSIS_BATCH_DELAY_IN_SECONDS * 1_000)
    }
  }

  return data
}
