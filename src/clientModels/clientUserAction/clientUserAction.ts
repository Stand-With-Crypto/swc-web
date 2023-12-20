import { ClientAddress, getClientAddress } from '@/clientModels/clientAddress'
import {
  ClientNonFungibleToken,
  getClientNonFungibleToken,
} from '@/clientModels/clientNonFungibleToken'
import { ClientUserActionType } from '@/clientModels/clientUserAction/clientUserActionEnums'
import { DTSIPersonForUserActions } from '@/data/dtsi/queries/queryDTSIPeopleBySlugForUserActions'
import {
  UserAction,
  UserActionCall,
  UserActionDonation,
  UserActionEmail,
  UserActionNFTMint,
  UserActionTweet,
  Address,
  UserActionEmailRecipient,
  NonFungibleToken,
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
  userActionCall: UserActionCall | null
  userActionDonation: UserActionDonation | null
  userActionNFTMint: (UserActionNFTMint & { nft: NonFungibleToken }) | null
  userActionTweet: UserActionTweet | null
}

type ClientUserActionEmailRecipient = Pick<UserActionEmailRecipient, 'id' | 'email'> & {
  person: DTSIPersonForUserActions
}
type ClientUserActionEmail = Pick<
  UserActionEmail,
  'zipCode' | 'senderEmail' | 'fullName' | 'phoneNumber'
> & {
  type: ClientUserActionType.EMAIL
  address: ClientAddress
  userActionEmailRecipients: ClientUserActionEmailRecipient[]
}
type ClientUserActionCall = Pick<UserActionCall, 'recipientPhoneNumber'> & {
  person: DTSIPersonForUserActions
} & { type: ClientUserActionType.CALL }
type ClientUserActionDonation = Pick<
  UserActionDonation,
  'amount' | 'amountCurrencyCode' | 'amountUsd'
> & { type: ClientUserActionType.DONATION }
type ClientUserActionNFTMint = Pick<
  UserActionNFTMint,
  'costAtMint' | 'costAtMintCurrencyCode' | 'constAtMintUsd'
> & { nft: ClientNonFungibleToken; type: ClientUserActionType.NFT_MINT }
type ClientUserActionTweet = { type: ClientUserActionType.TWEET }

/*
At the database schema level we can't enforce that a single action only has one "type" FK, but at the client level we can and should
*/
type ClientUserAction = Pick<UserAction, 'id' | 'datetimeOccurred'> &
  (
    | ClientUserActionEmail
    | ClientUserActionCall
    | ClientUserActionDonation
    | ClientUserActionNFTMint // TODO determine if we want to support NFTMints being offered alongside other actions (so you could have this type alongside others)
    | ClientUserActionTweet
  )

export const getClientUserAction = ({
  record,
  dtsiPeople,
}: {
  record: ClientUserActionDatabaseQuery
  dtsiPeople: DTSIPersonForUserActions[]
}): ClientUserAction => {
  // TODO determine how we want to "gracefully fail" if a DTSI slug doesn't exist
  const peopleBySlug = _.keyBy(dtsiPeople, x => x.slug)
  const {
    id,
    datetimeOccurred,
    userActionCall,
    userActionDonation,
    userActionEmail,
    userActionNFTMint,
    userActionTweet,
  } = record
  const sharedProps = { id, datetimeOccurred }
  if (userActionCall) {
    const { recipientPhoneNumber, recipientDtsiSlug } = userActionCall
    const callFields: ClientUserActionCall = {
      type: ClientUserActionType.CALL,
      recipientPhoneNumber,
      person: peopleBySlug[recipientDtsiSlug],
    }
    return { ...sharedProps, ...callFields }
  }
  if (userActionDonation) {
    const { amount, amountCurrencyCode, amountUsd } = userActionDonation
    const donationFields: ClientUserActionDonation = {
      type: ClientUserActionType.DONATION,
      amount,
      amountCurrencyCode,
      amountUsd,
    }
    return { ...sharedProps, ...donationFields }
  }
  if (userActionEmail) {
    const { zipCode, senderEmail, fullName, phoneNumber, address, userActionEmailRecipients } =
      userActionEmail
    const emailFields: ClientUserActionEmail = {
      type: ClientUserActionType.EMAIL,
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
  if (userActionNFTMint) {
    const { costAtMint, costAtMintCurrencyCode, constAtMintUsd, nft } = userActionNFTMint
    const mintFields: ClientUserActionNFTMint = {
      type: ClientUserActionType.NFT_MINT,
      costAtMint,
      costAtMintCurrencyCode,
      constAtMintUsd,
      nft: getClientNonFungibleToken(nft),
    }
    return { ...sharedProps, ...mintFields }
  }
  if (userActionTweet) {
    const tweetFields: ClientUserActionTweet = {
      type: ClientUserActionType.TWEET,
    }
    return { ...sharedProps, ...tweetFields }
  }
  throw new Error(`getClientUserAction: no user action fk found for id ${id}`)
}
