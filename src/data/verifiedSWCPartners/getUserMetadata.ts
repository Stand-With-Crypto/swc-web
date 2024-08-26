import { z } from 'zod'

import { getOrCreateSessionIdForUser } from '@/utils/server/externalOptIn/getOrCreateSessionIdForUser'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  VerifiedSWCPartner,
  VerifiedSWCPartnerApiResponse,
} from '@/utils/server/verifiedSWCPartner/constants'
import { getLogger } from '@/utils/shared/logger'
import { zodEmailAddress } from '@/validation/fields/zodEmailAddress'

export const zodVerifiedSWCPartnersGetUserMetadata = z.object({
  emailAddress: zodEmailAddress,
})

const logger = getLogger('verifiedSWCPartnerGetUserMetadata')

enum VerifiedSWCPartnersGetUserMetadataResult {
  EXISTS = 'exists',
}

type Input = z.infer<typeof zodVerifiedSWCPartnersGetUserMetadata> & {
  partner: VerifiedSWCPartner
}

export async function verifiedSWCPartnersGetUserMetadata(
  input: Input,
): Promise<VerifiedSWCPartnerApiResponse<'exists'> | null> {
  const { emailAddress } = input
  const user = await prismaClient.user.findFirst({
    include: {
      userEmailAddresses: true,
      userSessions: true,
    },
    where: {
      userEmailAddresses: {
        some: { emailAddress: emailAddress },
      },
    },
  })

  if (!user) {
    logger.info(`User not found`)
    return null
  }

  logger.info(`User found`)
  return {
    result: VerifiedSWCPartnersGetUserMetadataResult.EXISTS,
    resultOptions: Object.values(VerifiedSWCPartnersGetUserMetadataResult),
    sessionId: await getOrCreateSessionIdForUser(user),
    userId: user.id,
  }
}
