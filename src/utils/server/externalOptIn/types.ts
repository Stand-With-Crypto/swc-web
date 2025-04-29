import { Address, User, UserCryptoAddress, UserEmailAddress, UserSession } from '@prisma/client'
import { z } from 'zod'

import { VerifiedSWCPartner } from '@/utils/server/verifiedSWCPartner/constants'
import { getZodExternalUserActionOptInSchema } from '@/validation/userActionOptIn/zodExternalUserActionOptIn'

export enum ExternalUserActionOptInResult {
  NEW_ACTION = 'new-action',
  EXISTING_ACTION = 'existing-action',
}

export type UserWithRelations = User & {
  userEmailAddresses: UserEmailAddress[]
  userCryptoAddresses: UserCryptoAddress[]
  userSessions: Array<UserSession>
  address?: Address | null
}

export type Input = z.infer<ReturnType<typeof getZodExternalUserActionOptInSchema>> & {
  partner?: VerifiedSWCPartner
}

export type ExternalUserActionOptInResponse<ResultOptions extends string> = {
  result: ResultOptions
  resultOptions: ResultOptions[]
  sessionId: string
  userId: string
}
