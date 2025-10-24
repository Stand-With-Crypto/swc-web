import { postgridClient } from '@/utils/server/postgrid/postgridClient'
import { SendLetterParams } from '@/utils/server/postgrid/types'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('sendLetter')

export async function sendLetter(params: SendLetterParams) {
  if (!postgridClient) {
    logger.debug('PostGrid client not initialized. Skipping order creation.')
    return
  }

  const letter = await postgridClient.letters.create(
    {
      ...params,
      template: params.templateId,
      size: 'a4',
      description: `SWC Letter - ${params.metadata.campaignName}`,
    },
    {
      idempotencyKey: params.idempotencyKey,
    },
  )

  return letter
}
