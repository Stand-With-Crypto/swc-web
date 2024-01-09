import { ClientAddress, getClientAddress } from '@/clientModels/clientAddress'
import { ClientNFT, getClientNFT } from '@/clientModels/clientNFT'
import { ClientNFTMint, getClientNFTMint } from '@/clientModels/clientNFTMint'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { DTSIPersonForUserActions } from '@/data/dtsi/queries/queryDTSIPeopleBySlugForUserActions'
import {
  Address,
  NFT,
  NFTMint,
  UserAction,
  UserActionCall,
  UserActionDonation,
  UserActionEmail,
  UserActionEmailRecipient,
  UserActionOptIn,
  UserActionType,
} from '@prisma/client'
import _ from 'lodash'

/*
Assumption: we will always want to interact with the user actions and their related type joins together
If this ever changes, we may need to export the ClientUserActionEmail, ClientUserActionCall, etc fns
*/

type ClientUserActionDatabaseQuery = UserAction & {
  userActionEmail:
    | (UserActionEmail & {
        userActionEmailRecipients: UserActionEmailRecipient[]
      })
    | null
  nftMint: (NFTMint & { nft: NFT }) | null
  userActionCall: UserActionCall | null
  userActionDonation: UserActionDonation | null
  userActionOptIn: UserActionOptIn | null
}

type ClientUserActionEmailRecipient = Pick<UserActionEmailRecipient, 'id'> & {
  person: DTSIPersonForUserActions
}
type ClientUserActionEmail = {
  userActionEmailRecipients: ClientUserActionEmailRecipient[]
  actionType: typeof UserActionType.EMAIL
}
type ClientUserActionCall = Pick<UserActionCall, 'recipientPhoneNumber'> & {
  person: DTSIPersonForUserActions
  actionType: typeof UserActionType.CALL
}
type ClientUserActionDonation = Pick<UserActionDonation, 'amountCurrencyCode' | 'recipient'> & {
  actionType: typeof UserActionType.DONATION
  amount: number
  amountUsd: number
}
type ClientUserActionNFTMint = {
  nftMint: ClientNFTMint & { nft: ClientNFT }
  actionType: typeof UserActionType.NFT_MINT
}
type ClientUserActionOptIn = Pick<UserActionOptIn, 'optInType'> & {
  actionType: typeof UserActionType.OPT_IN
}
// Added here as a placeholder for type inference until we have some tweet-specific fields
type ClientUserActionTweet = { actionType: typeof UserActionType.TWEET }

/*
At the database schema level we can't enforce that a single action only has one "type" FK, but at the client level we can and should
*/
export type ClientUserAction = ClientModel<
  Pick<UserAction, 'id' | 'datetimeCreated' | 'actionType'> & {
    nftMint: (ClientNFTMint & { nft: ClientNFT }) | null
  } & (
      | ClientUserActionTweet
      | ClientUserActionOptIn
      | ClientUserActionEmail
      | ClientUserActionCall
      | ClientUserActionDonation
      | ClientUserActionNFTMint // TODO determine if we want to support NFTMints being offered alongside other actions (so you could have this type alongside others)
    )
>

const getRelatedModel = <K extends keyof ClientUserActionDatabaseQuery>(
  record: ClientUserActionDatabaseQuery,
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

export const getClientUserAction = ({
  record,
  dtsiPeople,
}: {
  record: ClientUserActionDatabaseQuery
  dtsiPeople: DTSIPersonForUserActions[]
}): ClientUserAction => {
  // TODO determine how we want to "gracefully fail" if a DTSI slug doesn't exist
  const peopleBySlug = _.keyBy(dtsiPeople, x => x.slug)
  const { id, datetimeCreated, actionType, nftMint } = record
  const sharedProps = {
    id,
    datetimeCreated,
    actionType,
    nftMint: nftMint
      ? {
          ...getClientNFTMint(nftMint),
          nft: getClientNFT(nftMint.nft),
        }
      : null,
  }
  switch (actionType) {
    case UserActionType.OPT_IN: {
      const { optInType } = getRelatedModel(record, 'userActionOptIn')
      const callFields: ClientUserActionOptIn = { optInType, actionType }
      return getClientModel({ ...sharedProps, ...callFields })
    }
    case UserActionType.CALL: {
      const { recipientPhoneNumber, recipientDtsiSlug } = getRelatedModel(record, 'userActionCall')
      const callFields: ClientUserActionCall = {
        recipientPhoneNumber,
        person: peopleBySlug[recipientDtsiSlug],
        actionType,
      }
      return getClientModel({ ...sharedProps, ...callFields })
    }
    case UserActionType.DONATION: {
      const { amount, amountCurrencyCode, amountUsd, recipient } = getRelatedModel(
        record,
        'userActionDonation',
      )
      const donationFields: ClientUserActionDonation = {
        amount: amount.toNumber(),
        amountUsd: amountUsd.toNumber(),
        amountCurrencyCode,
        recipient,
        actionType,
      }
      return getClientModel({ ...sharedProps, ...donationFields })
    }
    case UserActionType.EMAIL: {
      const { userActionEmailRecipients } = getRelatedModel(record, 'userActionEmail')
      const emailFields: ClientUserActionEmail = {
        actionType,
        userActionEmailRecipients: userActionEmailRecipients.map(x => ({
          id: x.id,
          person: peopleBySlug[x.dtsiSlug],
        })),
      }
      return getClientModel({ ...sharedProps, ...emailFields })
    }
    case UserActionType.NFT_MINT: {
      const mintFields: ClientUserActionNFTMint = {
        actionType,
        nftMint: sharedProps.nftMint!,
      }
      return getClientModel({ ...sharedProps, ...mintFields })
    }
    case UserActionType.TWEET: {
      return getClientModel({ ...sharedProps, actionType })
    }
  }
  throw new Error(`getClientUserAction: no user action fk found for id ${id}`)
}
