import {
  Address,
  NFTMint,
  UserAction,
  UserActionCall,
  UserActionDonation,
  UserActionEmail,
  UserActionEmailRecipient,
  UserActionOptIn,
  UserActionRsvpEvent,
  UserActionTweetAtPerson,
  UserActionType,
  UserActionViewKeyRaces,
  UserActionVoterAttestation,
  UserActionVoterRegistration,
  UserActionVotingInformationResearched,
} from '@prisma/client'
import { keyBy } from 'lodash-es'

import { ClientAddress, getClientAddress } from '@/clientModels/clientAddress'
import { ClientNFTMint, getClientNFTMint } from '@/clientModels/clientNFTMint'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { DTSIPersonForUserActions } from '@/data/dtsi/queries/queryDTSIPeopleBySlugForUserActions'
import {
  UserActionLiveEventCampaignName,
  UserActionTweetAtPersonCampaignName,
} from '@/utils/shared/userActionCampaigns'

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
  nftMint: NFTMint | null
  userActionCall: UserActionCall | null
  userActionDonation: UserActionDonation | null
  userActionOptIn: UserActionOptIn | null
  userActionVoterRegistration: UserActionVoterRegistration | null
  userActionTweetAtPerson: UserActionTweetAtPerson | null
  userActionVoterAttestation: UserActionVoterAttestation | null
  userActionRsvpEvent: UserActionRsvpEvent | null
  userActionViewKeyRaces: UserActionViewKeyRaces | null
  userActionVotingInformationResearched:
    | (UserActionVotingInformationResearched & {
        address: Address | null
      })
    | null
}

type ClientUserActionEmailRecipient = Pick<UserActionEmailRecipient, 'id'> & {
  person: DTSIPersonForUserActions | null
}
type ClientUserActionEmail = {
  userActionEmailRecipients: ClientUserActionEmailRecipient[]
  actionType: typeof UserActionType.EMAIL
}
type ClientUserActionCall = {
  person: DTSIPersonForUserActions | null
  actionType: typeof UserActionType.CALL
}
type ClientUserActionDonation = Pick<UserActionDonation, 'amountCurrencyCode' | 'recipient'> & {
  actionType: typeof UserActionType.DONATION
  amount: number
  amountUsd: number
}
type ClientUserActionNFTMint = {
  nftMint: ClientNFTMint
  actionType: typeof UserActionType.NFT_MINT
}
type ClientUserActionOptIn = Pick<UserActionOptIn, 'optInType'> & {
  actionType: typeof UserActionType.OPT_IN
}
// Added here as a placeholder for type inference until we have some tweet-specific fields
type ClientUserActionTweet = { actionType: typeof UserActionType.TWEET }
type ClientUserActionVoterRegistration = Pick<UserActionVoterRegistration, 'usaState'> & {
  actionType: typeof UserActionType.VOTER_REGISTRATION
}
type ClientUserActionLiveEvent = {
  actionType: typeof UserActionType.LIVE_EVENT
  campaignName: UserActionLiveEventCampaignName
}
type ClientUserActionTweetAtPerson = {
  actionType: typeof UserActionType.TWEET_AT_PERSON
  campaignName: UserActionTweetAtPersonCampaignName
  person: DTSIPersonForUserActions | null
}
type ClientUserActionVoterAttestation = Pick<UserActionVoterAttestation, 'usaState'> & {
  actionType: typeof UserActionType.VOTER_ATTESTATION
}
type ClientUserActionRsvpEvent = {
  actionType: typeof UserActionType.RSVP_EVENT
  eventSlug: string
  eventState: string
}
type ClientUserActionViewKeyRaces = Pick<
  UserActionViewKeyRaces,
  'usaState' | 'usCongressionalDistrict'
> & {
  actionType: typeof UserActionType.VIEW_KEY_RACES
}
type ClientUserActionVotingInformationResearched = Pick<
  UserActionVotingInformationResearched,
  'addressId' | 'shouldReceiveNotifications'
> & {
  address: ClientAddress | null
  actionType: typeof UserActionType.VOTING_INFORMATION_RESEARCHED
}

/*
At the database schema level we can't enforce that a single action only has one "type" FK, but at the client level we can and should
*/
export type ClientUserAction = ClientModel<
  Pick<UserAction, 'id' | 'actionType' | 'campaignName'> & {
    datetimeCreated: string
    nftMint: ClientNFTMint | null
  } & (
      | ClientUserActionTweet
      | ClientUserActionOptIn
      | ClientUserActionEmail
      | ClientUserActionCall
      | ClientUserActionDonation
      | ClientUserActionNFTMint
      | ClientUserActionVoterRegistration
      | ClientUserActionLiveEvent
      | ClientUserActionTweetAtPerson
      | ClientUserActionVoterAttestation
      | ClientUserActionRsvpEvent
      | ClientUserActionViewKeyRaces
      | ClientUserActionVotingInformationResearched
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
  const peopleBySlug = keyBy(dtsiPeople, x => x.slug)
  const { id, datetimeCreated, actionType, nftMint, campaignName } = record
  const sharedProps = {
    id,
    datetimeCreated: datetimeCreated.toISOString(),
    actionType,
    campaignName,
    nftMint: nftMint
      ? {
          ...getClientNFTMint(nftMint),
        }
      : null,
  }

  const actionTypes: {
    [key in UserActionType]: () => ClientModel<ClientUserAction>
  } = {
    [UserActionType.OPT_IN]: () => {
      const { optInType } = getRelatedModel(record, 'userActionOptIn')
      const optInFields: ClientUserActionOptIn = { optInType, actionType: UserActionType.OPT_IN }
      return getClientModel({ ...sharedProps, ...optInFields })
    },

    [UserActionType.CALL]: () => {
      const { recipientDtsiSlug } = getRelatedModel(record, 'userActionCall')
      const callFields: ClientUserActionCall = {
        person: recipientDtsiSlug ? peopleBySlug[recipientDtsiSlug] : null,
        actionType: UserActionType.CALL,
      }
      return getClientModel({ ...sharedProps, ...callFields })
    },
    [UserActionType.DONATION]: () => {
      const { amount, amountCurrencyCode, amountUsd, recipient } = getRelatedModel(
        record,
        'userActionDonation',
      )
      const donationFields: ClientUserActionDonation = {
        amount: amount.toNumber(),
        amountUsd: amountUsd.toNumber(),
        amountCurrencyCode,
        recipient,
        actionType: UserActionType.DONATION,
      }
      return getClientModel({ ...sharedProps, ...donationFields })
    },
    [UserActionType.EMAIL]: () => {
      const { userActionEmailRecipients } = getRelatedModel(record, 'userActionEmail')
      const emailFields: ClientUserActionEmail = {
        actionType: UserActionType.EMAIL,
        userActionEmailRecipients: userActionEmailRecipients.map(x => ({
          id: x.id,
          person: x.dtsiSlug ? peopleBySlug[x.dtsiSlug] : null,
        })),
      }
      return getClientModel({ ...sharedProps, ...emailFields })
    },
    [UserActionType.NFT_MINT]: () => {
      const mintFields: ClientUserActionNFTMint = {
        actionType: UserActionType.NFT_MINT,
        nftMint: sharedProps.nftMint!,
      }
      return getClientModel({ ...sharedProps, ...mintFields })
    },
    [UserActionType.TWEET]: () => {
      return getClientModel({ ...sharedProps, actionType: UserActionType.TWEET })
    },
    [UserActionType.VOTER_REGISTRATION]: () => {
      const { usaState } = getRelatedModel(record, 'userActionVoterRegistration')
      const voterRegistrationFields: ClientUserActionVoterRegistration = {
        usaState,
        actionType: UserActionType.VOTER_REGISTRATION,
      }
      return getClientModel({ ...sharedProps, ...voterRegistrationFields })
    },
    [UserActionType.LIVE_EVENT]: () => {
      const _campaignName = sharedProps.campaignName as UserActionLiveEventCampaignName
      return getClientModel({
        ...sharedProps,
        actionType: UserActionType.LIVE_EVENT,
        campaignName: _campaignName,
      })
    },
    [UserActionType.TWEET_AT_PERSON]: () => {
      const { recipientDtsiSlug } = getRelatedModel(record, 'userActionTweetAtPerson')
      const tweetAtPersonFields: ClientUserActionTweetAtPerson = {
        person: recipientDtsiSlug ? peopleBySlug[recipientDtsiSlug] : null,
        campaignName: record.campaignName as UserActionTweetAtPersonCampaignName,
        actionType: UserActionType.TWEET_AT_PERSON,
      }
      return getClientModel({ ...sharedProps, ...tweetAtPersonFields })
    },
    [UserActionType.VOTER_ATTESTATION]: () => {
      const { usaState } = getRelatedModel(record, 'userActionVoterAttestation')
      const clientModelFields: ClientUserActionVoterAttestation = {
        actionType: UserActionType.VOTER_ATTESTATION,
        usaState,
      }
      return getClientModel({ ...sharedProps, ...clientModelFields })
    },
    [UserActionType.RSVP_EVENT]: () => {
      const { eventSlug, eventState } = getRelatedModel(record, 'userActionRsvpEvent')
      const rsvpEventFields: ClientUserActionRsvpEvent = {
        eventSlug,
        eventState,
        actionType: UserActionType.RSVP_EVENT,
      }
      return getClientModel({ ...sharedProps, ...rsvpEventFields })
    },
    [UserActionType.VIEW_KEY_RACES]: () => {
      const { usaState, usCongressionalDistrict } = getRelatedModel(
        record,
        'userActionViewKeyRaces',
      )
      const keyRacesFields: ClientUserActionViewKeyRaces = {
        usaState,
        usCongressionalDistrict,
        actionType: UserActionType.VIEW_KEY_RACES,
      }
      return getClientModel({ ...sharedProps, ...keyRacesFields })
    },
    [UserActionType.VOTING_INFORMATION_RESEARCHED]: () => {
      const { address, addressId, shouldReceiveNotifications } = getRelatedModel(
        record,
        'userActionVotingInformationResearched',
      )
      const votingInformationFields: ClientUserActionVotingInformationResearched = {
        address: address ? getClientAddress(address) : null,
        addressId,
        shouldReceiveNotifications,
        actionType: UserActionType.VOTING_INFORMATION_RESEARCHED,
      }
      return getClientModel({ ...sharedProps, ...votingInformationFields })
    },
  }

  const getClientModelFromActionType = actionTypes[actionType]

  if (!getClientModelFromActionType) {
    throw new Error(`getClientUserAction: no user action fk found for id ${id}`)
  }

  return getClientModelFromActionType()
}
