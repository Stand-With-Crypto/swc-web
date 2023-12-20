import { ClientAddress, getClientAddress } from '@/clientModels/clientAddress'
import { ClientNFT, getClientNFT } from '@/clientModels/clientNFT'
import { ClientNFTMint, getClientNFTMint } from '@/clientModels/clientNFTMint'
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
        address: Address
        userActionEmailRecipients: UserActionEmailRecipient[]
      })
    | null
  nftMint: (NFTMint & { nft: NFT }) | null
  userActionCall: UserActionCall | null
  userActionDonation: UserActionDonation | null
  userActionOptIn: UserActionOptIn | null
}

type ClientUserActionEmailRecipient = Pick<UserActionEmailRecipient, 'id' | 'email'> & {
  person: DTSIPersonForUserActions
}
type ClientUserActionEmail = Pick<
  UserActionEmail,
  'zipCode' | 'senderEmail' | 'fullName' | 'phoneNumber'
> & {
  address: ClientAddress
  userActionEmailRecipients: ClientUserActionEmailRecipient[]
}
type ClientUserActionCall = Pick<UserActionCall, 'recipientPhoneNumber'> & {
  person: DTSIPersonForUserActions
}
type ClientUserActionDonation = Pick<
  UserActionDonation,
  'amount' | 'amountCurrencyCode' | 'amountUsd'
>
type ClientUserActionNFTMint = {
  nftMint: ClientNFTMint & { nft: ClientNFT }
}
type ClientUserActionOptIn = Pick<UserActionOptIn, 'optInType'>
// Added here as a placeholder for type inference until we have some tweet-specific fields
type ClientUserActionTweet = { __tweetType: true }

/*
At the database schema level we can't enforce that a single action only has one "type" FK, but at the client level we can and should
*/
type ClientUserAction = Pick<UserAction, 'id' | 'datetimeOccurred' | 'actionType'> &
  (
    | ClientUserActionTweet
    | ClientUserActionOptIn
    | ClientUserActionEmail
    | ClientUserActionCall
    | ClientUserActionDonation
    | ClientUserActionNFTMint // TODO determine if we want to support NFTMints being offered alongside other actions (so you could have this type alongside others)
  )

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
  const { id, datetimeOccurred, actionType } = record
  const sharedProps = { id, datetimeOccurred, actionType }
  switch (actionType) {
    case UserActionType.OPT_IN: {
      const { optInType } = getRelatedModel(record, 'userActionOptIn')
      const callFields: ClientUserActionOptIn = { optInType }
      return { ...sharedProps, ...callFields }
    }
    case UserActionType.CALL: {
      const { recipientPhoneNumber, recipientDtsiSlug } = getRelatedModel(record, 'userActionCall')
      const callFields: ClientUserActionCall = {
        recipientPhoneNumber,
        person: peopleBySlug[recipientDtsiSlug],
      }
      return { ...sharedProps, ...callFields }
    }
    case UserActionType.DONATION: {
      const { amount, amountCurrencyCode, amountUsd } = getRelatedModel(
        record,
        'userActionDonation',
      )
      const donationFields: ClientUserActionDonation = {
        amount,
        amountCurrencyCode,
        amountUsd,
      }
      return { ...sharedProps, ...donationFields }
    }
    case UserActionType.EMAIL: {
      const { zipCode, senderEmail, fullName, phoneNumber, address, userActionEmailRecipients } =
        getRelatedModel(record, 'userActionEmail')
      const emailFields: ClientUserActionEmail = {
        zipCode,
        senderEmail,
        fullName,
        phoneNumber,
        address: getClientAddress(address),
        userActionEmailRecipients: userActionEmailRecipients.map(x => ({
          id: x.id,
          email: x.email,
          person: peopleBySlug[x.dtsiSlug],
        })),
      }
      return { ...sharedProps, ...emailFields }
    }
    case UserActionType.NFT_MINT: {
      const nftMint = getRelatedModel(record, 'nftMint')
      const mintFields: ClientUserActionNFTMint = {
        nftMint: {
          ...getClientNFTMint(nftMint),
          nft: getClientNFT(nftMint.nft),
        },
      }
      return { ...sharedProps, ...mintFields }
    }
    case UserActionType.TWEET: {
      return { ...sharedProps, __tweetType: true }
    }
  }

  throw new Error(`getClientUserAction: no user action fk found for id ${id}`)
}
