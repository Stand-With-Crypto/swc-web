import {
  Address,
  NFTMint,
  UserAction,
  UserActionCall,
  UserActionDonation,
  UserActionEmail,
  UserActionEmailRecipient,
  UserActionOptIn,
  UserActionPoll,
  UserActionPollAnswer,
  UserActionRefer,
  UserActionRsvpEvent,
  UserActionTweetAtPerson,
  UserActionType,
  UserActionViewKeyPage,
  UserActionViewKeyRaces,
  UserActionVoterAttestation,
  UserActionVoterRegistration,
  UserActionVotingDay,
  UserActionVotingInformationResearched,
} from '@prisma/client'
import { keyBy } from 'lodash-es'

import { ClientAddress, getClientAddress } from '@/clientModels/clientAddress'
import { ClientNFTMint, getClientNFTMint } from '@/clientModels/clientNFTMint'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { DTSIPersonForUserActions } from '@/data/dtsi/queries/queryDTSIPeopleBySlugForUserActions'
import {
  USUserActionLiveEventCampaignName,
  USUserActionTweetAtPersonCampaignName,
} from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

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
  userActionVotingDay: UserActionVotingDay | null
  userActionRefer: UserActionRefer | null
  userActionPoll:
    | (UserActionPoll & {
        userActionPollAnswers: UserActionPollAnswer[]
      })
    | null
  userActionViewKeyPage: UserActionViewKeyPage | null
}

type ClientUserActionEmailRecipient = Pick<UserActionEmailRecipient, 'id'> & {
  person: DTSIPersonForUserActions | null
}
interface ClientUserActionEmail {
  userActionEmailRecipients: ClientUserActionEmailRecipient[]
  actionType: typeof UserActionType.EMAIL
}
interface ClientUserActionCall {
  person: DTSIPersonForUserActions | null
  actionType: typeof UserActionType.CALL
}
type ClientUserActionDonation = Pick<UserActionDonation, 'amountCurrencyCode' | 'recipient'> & {
  actionType: typeof UserActionType.DONATION
  amount: number
  amountUsd: number
}
interface ClientUserActionNFTMint {
  nftMint: ClientNFTMint
  actionType: typeof UserActionType.NFT_MINT
}
type ClientUserActionOptIn = Pick<UserActionOptIn, 'optInType'> & {
  actionType: typeof UserActionType.OPT_IN
}
// Added here as a placeholder for type inference until we have some tweet-specific fields
interface ClientUserActionTweet {
  actionType: typeof UserActionType.TWEET
}
// Added here as a placeholder for type inference until we have some linkedin-specific fields
interface ClientUserActionLinkedIn {
  actionType: typeof UserActionType.LINKEDIN
}
type ClientUserActionVoterRegistration = Pick<UserActionVoterRegistration, 'usaState'> & {
  actionType: typeof UserActionType.VOTER_REGISTRATION
}
interface ClientUserActionLiveEvent {
  actionType: typeof UserActionType.LIVE_EVENT
  campaignName: USUserActionLiveEventCampaignName
}
interface ClientUserActionTweetAtPerson {
  actionType: typeof UserActionType.TWEET_AT_PERSON
  campaignName: USUserActionTweetAtPersonCampaignName
  person: DTSIPersonForUserActions | null
}
type ClientUserActionVoterAttestation = Pick<UserActionVoterAttestation, 'usaState'> & {
  actionType: typeof UserActionType.VOTER_ATTESTATION
}
interface ClientUserActionRsvpEvent {
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
type ClientUserActionVotingDay = Pick<UserActionVotingDay, 'votingYear'> & {
  actionType: typeof UserActionType.VOTING_DAY
}
type ClientUserActionPollAnswer = Pick<
  UserActionPollAnswer,
  'answer' | 'isOtherAnswer' | 'userActionCampaignName'
>
type ClientUserActionRefer = Pick<UserActionRefer, 'referralsCount'> & {
  actionType: typeof UserActionType.REFER
}
interface ClientUserActionPoll {
  actionType: typeof UserActionType.POLL
  userActionPollAnswers: ClientUserActionPollAnswer[]
}
interface ClientUserActionViewKeyPage {
  actionType: typeof UserActionType.VIEW_KEY_PAGE
  path: string
}

/*
At the database schema level we can't enforce that a single action only has one "type" FK, but at the client level we can and should
*/
export type ClientUserAction = ClientModel<
  Pick<UserAction, 'id' | 'actionType' | 'campaignName' | 'countryCode'> & {
    datetimeCreated: string
    nftMint: ClientNFTMint | null
  } & (
      | ClientUserActionTweet
      | ClientUserActionLinkedIn
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
      | ClientUserActionVotingDay
      | ClientUserActionRefer
      | ClientUserActionPoll
      | ClientUserActionViewKeyPage
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
    countryCode: record.countryCode,
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
      const _campaignName = sharedProps.campaignName as USUserActionLiveEventCampaignName
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
        campaignName: record.campaignName as USUserActionTweetAtPersonCampaignName,
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
    [UserActionType.VOTING_DAY]: () => {
      const { votingYear } = getRelatedModel(record, 'userActionVotingDay')
      const votingDayFields: ClientUserActionVotingDay = {
        votingYear,
        actionType: UserActionType.VOTING_DAY,
      }
      return getClientModel({ ...sharedProps, ...votingDayFields })
    },
    [UserActionType.REFER]: () => {
      const { referralsCount } = getRelatedModel(record, 'userActionRefer')
      const referFields: ClientUserActionRefer = {
        referralsCount,
        actionType: UserActionType.REFER,
      }
      return getClientModel({ ...sharedProps, ...referFields })
    },
    [UserActionType.POLL]: () => {
      const { userActionPollAnswers } = getRelatedModel(record, 'userActionPoll')
      const pollFields: ClientUserActionPoll = {
        actionType: UserActionType.POLL,
        userActionPollAnswers: userActionPollAnswers.map(x => ({
          answer: x.answer,
          isOtherAnswer: x.isOtherAnswer,
          userActionCampaignName: x.userActionCampaignName,
        })),
      }
      return getClientModel({ ...sharedProps, ...pollFields })
    },
    [UserActionType.VIEW_KEY_PAGE]: () => {
      const { path } = getRelatedModel(record, 'userActionViewKeyPage')
      const viewKeyPageFields: ClientUserActionViewKeyPage = {
        path,
        actionType: UserActionType.VIEW_KEY_PAGE,
      }
      return getClientModel({ ...sharedProps, ...viewKeyPageFields })
    },
    [UserActionType.LINKEDIN]: () => {
      return getClientModel({ ...sharedProps, actionType: UserActionType.LINKEDIN })
    },
  }

  const getClientModelFromActionType = actionTypes[actionType]

  if (!getClientModelFromActionType) {
    throw new Error(`getClientUserAction: no user action fk found for id ${id}`)
  }

  return getClientModelFromActionType()
}
