import { postgridClient } from '@/utils/server/postgrid/postgridClient'
import { CreateLetterParams } from '@/utils/server/postgrid/types'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('postgrid.createLetter')

export async function createLetter(params: CreateLetterParams) {
  if (!postgridClient) {
    logger.debug('PostGrid client not initialized. Skipping order creation.')
    return
  }

  const letter = await postgridClient.letters.create(
    {
      to: params.to,
      from: params.from,
      template: params.templateId,
      description: `SWC Letter - ${params.metadata.campaignName}`,
      metadata: {
        ...params.metadata,
      },
      size: 'a4',
    },
    {
      idempotencyKey: params.idempotencyKey,
    },
  )

  logger.info('Letter created successfully', {
    letterId: letter.id,
    status: letter.status,
    idempotencyKey: params.idempotencyKey,
  })

  return letter
}
