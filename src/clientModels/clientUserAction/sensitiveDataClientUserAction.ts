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
If this ever changes, we may need to export the SensitiveDataClientUserActionEmail, SensitiveDataClientUserActionCall, etc fns
*/

type SensitiveDataClientUserActionDatabaseQuery = UserAction & {
  userActionEmail:
    | (UserActionEmail & {
        address: Address
        userActionEmailRecipients: UserActionEmailRecipient[]
      })
    | null
  nftMint: (NFTMint & { nft: NFT }) | null
  userActionCall: UserActionCall | null
  userActionDonation: UserActionDonation | null
  userActionOptIn: UserActionOptIn | null
}

type SensitiveDataClientUserActionEmailRecipient = Pick<UserActionEmailRecipient, 'id'> & {
  person: DTSIPersonForUserActions
}
type SensitiveDataClientUserActionEmail = Pick<
  UserActionEmail,
  'senderEmail' | 'fullName' | 'phoneNumber'
> & {
  address: ClientAddress
  userActionEmailRecipients: SensitiveDataClientUserActionEmailRecipient[]
  actionType: typeof UserActionType.EMAIL
}
type SensitiveDataClientUserActionCall = Pick<UserActionCall, 'recipientPhoneNumber'> & {
  person: DTSIPersonForUserActions
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
  nftMint: ClientNFTMint & { nft: ClientNFT }
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
  Pick<UserAction, 'id' | 'datetimeCreated' | 'actionType'> & {
    nftMint: (ClientNFTMint & { nft: ClientNFT }) | null
  } & (
      | SensitiveDataClientUserActionTweet
      | SensitiveDataClientUserActionOptIn
      | SensitiveDataClientUserActionEmail
      | SensitiveDataClientUserActionCall
      | SensitiveDataClientUserActionDonation
      | SensitiveDataClientUserActionNFTMint // TODO determine if we want to support NFTMints being offered alongside other actions (so you could have this type alongside others)
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
  dtsiPeople,
}: {
  record: SensitiveDataClientUserActionDatabaseQuery
  dtsiPeople: DTSIPersonForUserActions[]
}): SensitiveDataClientUserAction => {
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
      const callFields: SensitiveDataClientUserActionOptIn = { optInType, actionType }
      return getClientModel({ ...sharedProps, ...callFields })
    }
    case UserActionType.CALL: {
      const { recipientPhoneNumber, recipientDtsiSlug } = getRelatedModel(record, 'userActionCall')
      const callFields: SensitiveDataClientUserActionCall = {
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
      const { senderEmail, fullName, phoneNumber, address, userActionEmailRecipients } =
        getRelatedModel(record, 'userActionEmail')
      const emailFields: SensitiveDataClientUserActionEmail = {
        actionType,
        senderEmail,
        fullName,
        phoneNumber,
        address: getClientAddress(address),
        userActionEmailRecipients: userActionEmailRecipients.map(x => ({
          id: x.id,
          person: peopleBySlug[x.dtsiSlug],
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
