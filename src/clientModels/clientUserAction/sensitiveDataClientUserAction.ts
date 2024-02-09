import { ClientAddress, getClientAddress } from '@/clientModels/clientAddress'
import { ClientNFTMint, getClientNFTMint } from '@/clientModels/clientNFTMint'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import {
  Address,
  NFTMint,
  UserAction,
  UserActionCall,
  UserActionDonation,
  UserActionEmail,
  UserActionEmailRecipient,
  UserActionOptIn,
  UserActionType,
} from '@prisma/client'

/*
Assumption: we will always want to interact with the user actions and their related type joins together
If this ever changes, we may need to export the SensitiveDataClientUserActionEmail, SensitiveDataClientUserActionCall, etc fns
*/

type SensitiveDataClientUserActionDatabaseQuery = UserAction & {
  userActionEmail:
    | (UserActionEmail & {
        address: Address
        userActionEmailRecipients: UserActionEmailRecipient[]
      })
    | null
  nftMint: NFTMint | null
  userActionCall: UserActionCall | null
  userActionDonation: UserActionDonation | null
  userActionOptIn: UserActionOptIn | null
}

type SensitiveDataClientUserActionEmailRecipient = Pick<UserActionEmailRecipient, 'id'>
type SensitiveDataClientUserActionEmail = Pick<
  UserActionEmail,
  'senderEmail' | 'firstName' | 'lastName'
> & {
  address: ClientAddress
  userActionEmailRecipients: SensitiveDataClientUserActionEmailRecipient[]
  actionType: typeof UserActionType.EMAIL
}
type SensitiveDataClientUserActionCall = Pick<UserActionCall, 'recipientPhoneNumber'> & {
  actionType: typeof UserActionType.CALL
}
type SensitiveDataClientUserActionDonation = Pick<
  UserActionDonation,
  'amountCurrencyCode' | 'recipient'
> & {
  amount: number
  amountUsd: number
  actionType: typeof UserActionType.DONATION
}
type SensitiveDataClientUserActionNFTMint = {
  nftMint: ClientNFTMint
  actionType: typeof UserActionType.NFT_MINT
}
type SensitiveDataClientUserActionOptIn = Pick<UserActionOptIn, 'optInType'> & {
  actionType: typeof UserActionType.OPT_IN
}
// Added here as a placeholder for type inference until we have some tweet-specific fields
type SensitiveDataClientUserActionTweet = { actionType: typeof UserActionType.TWEET }

/*
At the database schema level we can't enforce that a single action only has one "type" FK, but at the client level we can and should
*/
export type SensitiveDataClientUserAction = ClientModel<
  Pick<UserAction, 'id' | 'actionType'> & {
    nftMint: ClientNFTMint | null
    datetimeCreated: string
  } & (
      | SensitiveDataClientUserActionTweet
      | SensitiveDataClientUserActionOptIn
      | SensitiveDataClientUserActionEmail
      | SensitiveDataClientUserActionCall
      | SensitiveDataClientUserActionDonation
      | SensitiveDataClientUserActionNFTMint
    )
>

const getRelatedModel = <K extends keyof SensitiveDataClientUserActionDatabaseQuery>(
  record: SensitiveDataClientUserActionDatabaseQuery,
  key: K,
) => {
  const val = record[key]
  if (!val) {
    throw new Error(
      `getRelatedModel: no ${key} found for id ${record.id} of type ${record.actionType}`,
    )
  }
  return val
}

export const getSensitiveDataClientUserAction = ({
  record,
}: {
  record: SensitiveDataClientUserActionDatabaseQuery
}): SensitiveDataClientUserAction => {
  const { id, datetimeCreated, actionType, nftMint } = record
  const sharedProps = {
    id,
    datetimeCreated: datetimeCreated.toISOString(),
    actionType,
    nftMint: nftMint
      ? {
          ...getClientNFTMint(nftMint),
        }
      : null,
  }
  switch (actionType) {
    case UserActionType.OPT_IN: {
      const { optInType } = getRelatedModel(record, 'userActionOptIn')
      const callFields: SensitiveDataClientUserActionOptIn = { optInType, actionType }
      return getClientModel({ ...sharedProps, ...callFields })
    }
    case UserActionType.CALL: {
      const { recipientPhoneNumber } = getRelatedModel(record, 'userActionCall')
      const callFields: SensitiveDataClientUserActionCall = {
        recipientPhoneNumber,
        actionType,
      }
      return getClientModel({ ...sharedProps, ...callFields })
    }
    case UserActionType.DONATION: {
      const { amount, amountCurrencyCode, amountUsd, recipient } = getRelatedModel(
        record,
        'userActionDonation',
      )
      const donationFields: SensitiveDataClientUserActionDonation = {
        amount: amount.toNumber(),
        amountUsd: amountUsd.toNumber(),
        amountCurrencyCode,
        actionType,
        recipient,
      }
      return getClientModel({ ...sharedProps, ...donationFields })
    }
    case UserActionType.EMAIL: {
      const { senderEmail, firstName, lastName, address, userActionEmailRecipients } =
        getRelatedModel(record, 'userActionEmail')
      const emailFields: SensitiveDataClientUserActionEmail = {
        actionType,
        senderEmail,
        firstName,
        lastName,
        address: getClientAddress(address),
        userActionEmailRecipients: userActionEmailRecipients.map(x => ({
          id: x.id,
        })),
      }
      return getClientModel({ ...sharedProps, ...emailFields })
    }
    case UserActionType.NFT_MINT: {
      const mintFields: SensitiveDataClientUserActionNFTMint = {
        actionType,
        nftMint: sharedProps.nftMint!,
      }
      return getClientModel({ ...sharedProps, ...mintFields })
    }
    case UserActionType.TWEET: {
      return getClientModel({ ...sharedProps, actionType })
    }
  }

  throw new Error(`getSensitiveDataClientUserAction: no user action fk found for id ${id}`)
}
