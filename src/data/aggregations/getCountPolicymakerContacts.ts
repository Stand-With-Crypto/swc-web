import 'server-only'

import { UserActionType } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export const getCountPolicymakerContacts = async () => {
  const [countUserActionEmailRecipients, countUserActionCalls] = await Promise.all([
    prismaClient.userActionEmailRecipient.count(),
    prismaClient.userAction.count({ where: { actionType: UserActionType.CALL } }),
  ])
  /*
  We also return the sum of the following hardcoded numbers:
  - Capitol Canary emails: because not every email sent to a policymaker via Capitol Canary
    is recorded in our Coinbase database (i.e. did not go through the Stand With Crypto website), we
    are compensating for the missing emails sent via other Capitol Canary campaigns, which includes
    the emails sent from both the Stand With Crypto account and the legacy (Coinbase) account.
  - Calls: because the Coinbase database did not properly capture calls to policymakers,
    the data migration from Coinbase to Stand With Crypto could only confidently acknowledge calls in which
    the caller received the airdropped NFT. Thus, we compensate for the missing calls that were recorded
    from Coinbase's front-end analytics.
  - IRS contacts: similar to the calls, Coinbase never stored this information in this database. The hardcoded
    number is an estimate of the number of IRS contacts that were made via the Stand With Crypto website.
  */
  const hardcodedCountCapitolCanaryEmails = 36173
  const hardcodedCountCalls = 14635
  const hardcodedCountIrsContacts = 52000

  const hardcodedCountSum =
    hardcodedCountCapitolCanaryEmails + hardcodedCountCalls + hardcodedCountIrsContacts

  if (NEXT_PUBLIC_ENVIRONMENT === 'production') {
    return {
      countUserActionEmailRecipients,
      countUserActionCalls,
      hardcodedCountSum,
    }
  }
  /*
  Our database in testing env is populated with way less info but we want the UI
  to look comparable to production so we mock the numbers
  */
  return {
    countUserActionEmailRecipients: countUserActionEmailRecipients * 1011,
    countUserActionCalls: countUserActionCalls * 1011,
    hardcodedCountSum,
  }
}
