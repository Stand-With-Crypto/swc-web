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
  UserActionViewKeyRaces,
  UserActionVoterAttestation,
  UserActionVoterRegistration,
  UserActionVotingDay,
  UserActionVotingInformationResearched,
} from '@prisma/client'

import { ClientAddress, getClientAddress } from '@/clientModels/clientAddress'
import { ClientNFTMint, getClientNFTMint } from '@/clientModels/clientNFTMint'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

/*
Assumption: we will always want to interact with the user actions and their related type joins together
If this ever changes, we may need to export the SensitiveDataClientUserActionEmail, SensitiveDataClientUserActionCall, etc fns
*/

type SensitiveDataClientUserActionDatabaseQuery = UserAction & {
  userActionEmail:
    | (UserActionEmail & {
        address: Address | null
        userActionEmailRecipients: UserActionEmailRecipient[]
      })
    | null
  nftMint: NFTMint | null
  userActionCall: UserActionCall | null
  userActionDonation: UserActionDonation | null
  userActionOptIn: UserActionOptIn | null
  userActionVoterRegistration: UserActionVoterRegistration | null
  userActionTweetAtPerson: UserActionTweetAtPerson | null
  userActionRsvpEvent: UserActionRsvpEvent | null
  userActionVoterAttestation: UserActionVoterAttestation | null
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
}

type SensitiveDataClientUserActionEmailRecipient = Pick<UserActionEmailRecipient, 'id'>
type SensitiveDataClientUserActionEmail = Pick<
  UserActionEmail,
  'senderEmail' | 'firstName' | 'lastName'
> & {
  // all SensitiveDataClientUserActionEmail should have addresses, but we want to gracefully fail if google starts hard-capping us for some reason
  address: ClientAddress | null
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
type SensitiveDataClientUserActionVoterRegistration = Pick<
  UserActionVoterRegistration,
  'usaState'
> & {
  actionType: typeof UserActionType.VOTER_REGISTRATION
}
type SensitiveDataClientUserActionLiveEvent = { actionType: typeof UserActionType.LIVE_EVENT }
type SensitiveDataClientUserActionTweetAtPerson = {
  actionType: typeof UserActionType.TWEET_AT_PERSON
  recipientDtsiSlug: string | null
}
type SensitiveDataClientUserActionRsvpEvent = {
  actionType: typeof UserActionType.RSVP_EVENT
  eventSlug: string
  eventState: string
}
type SensitiveDataClientUserActionVoterAttestation = Pick<
  UserActionVoterAttestation,
  'usaState'
> & {
  actionType: typeof UserActionType.VOTER_ATTESTATION
}
type SensitiveDataClientUserActionViewKeyRaces = Pick<
  UserActionViewKeyRaces,
  'usaState' | 'usCongressionalDistrict'
> & {
  actionType: typeof UserActionType.VIEW_KEY_RACES
}
type SensitiveDataClientUserActionVotingInformationResearched = Pick<
  UserActionVotingInformationResearched,
  'addressId' | 'shouldReceiveNotifications'
> & {
  address: ClientAddress | null
  actionType: typeof UserActionType.VOTING_INFORMATION_RESEARCHED
}
type SensitiveDataClientUserActionVotingDay = Pick<UserActionVotingDay, 'votingYear'> & {
  actionType: typeof UserActionType.VOTING_DAY
}
type SensitiveDataClientUserActionPollAnswer = Pick<
  UserActionPollAnswer,
  'answer' | 'isOtherAnswer' | 'userActionCampaignName'
>
type SensitiveDataClientUserActionPoll = {
  actionType: typeof UserActionType.POLL
  userActionPollAnswers: SensitiveDataClientUserActionPollAnswer[]
}

type SensitiveDataClientUserActionRefer = Pick<UserActionRefer, 'referralsCount'> & {
  actionType: typeof UserActionType.REFER
}

/*
At the database schema level we can't enforce that a single action only has one "type" FK, but at the client level we can and should
*/
export type SensitiveDataClientUserAction = ClientModel<
  Pick<UserAction, 'id' | 'actionType' | 'campaignName'> & {
    nftMint: ClientNFTMint | null
    datetimeCreated: string
    countryCode: SupportedCountryCodes
  } & (
      | SensitiveDataClientUserActionTweet
      | SensitiveDataClientUserActionOptIn
      | SensitiveDataClientUserActionEmail
      | SensitiveDataClientUserActionCall
      | SensitiveDataClientUserActionDonation
      | SensitiveDataClientUserActionNFTMint
      | SensitiveDataClientUserActionVoterRegistration
      | SensitiveDataClientUserActionLiveEvent
      | SensitiveDataClientUserActionTweetAtPerson
      | SensitiveDataClientUserActionRsvpEvent
      | SensitiveDataClientUserActionVoterAttestation
      | SensitiveDataClientUserActionViewKeyRaces
      | SensitiveDataClientUserActionVotingInformationResearched
      | SensitiveDataClientUserActionVotingDay
      | SensitiveDataClientUserActionRefer
      | SensitiveDataClientUserActionPoll
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
  const { id, datetimeCreated, actionType, nftMint, campaignName, countryCode } = record
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
    countryCode: countryCode as SupportedCountryCodes,
  }

  const actionTypes: {
    [key in UserActionType]: () => ClientModel<SensitiveDataClientUserAction>
  } = {
    [UserActionType.OPT_IN]: () => {
      const { optInType } = getRelatedModel(record, 'userActionOptIn')
      const callFields: SensitiveDataClientUserActionOptIn = {
        optInType,
        actionType: UserActionType.OPT_IN,
      }
      return getClientModel({ ...sharedProps, ...callFields })
    },
    [UserActionType.CALL]: () => {
      const { recipientPhoneNumber } = getRelatedModel(record, 'userActionCall')
      const callFields: SensitiveDataClientUserActionCall = {
        recipientPhoneNumber,
        actionType: UserActionType.CALL,
      }
      return getClientModel({ ...sharedProps, ...callFields })
    },
    [UserActionType.DONATION]: () => {
      const { amount, amountCurrencyCode, amountUsd, recipient } = getRelatedModel(
        record,
        'userActionDonation',
      )
      const donationFields: SensitiveDataClientUserActionDonation = {
        amount: amount.toNumber(),
        amountUsd: amountUsd.toNumber(),
        amountCurrencyCode,
        actionType: UserActionType.DONATION,
        recipient,
      }
      return getClientModel({ ...sharedProps, ...donationFields })
    },
    [UserActionType.EMAIL]: () => {
      const { senderEmail, firstName, lastName, address, userActionEmailRecipients } =
        getRelatedModel(record, 'userActionEmail')
      const emailFields: SensitiveDataClientUserActionEmail = {
        actionType: UserActionType.EMAIL,
        senderEmail,
        firstName,
        lastName,
        address: address ? getClientAddress(address) : null,
        userActionEmailRecipients: userActionEmailRecipients.map(x => ({
          id: x.id,
        })),
      }
      return getClientModel({ ...sharedProps, ...emailFields })
    },
    [UserActionType.NFT_MINT]: () => {
      const mintFields: SensitiveDataClientUserActionNFTMint = {
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
      const voterRegistrationFields: SensitiveDataClientUserActionVoterRegistration = {
        usaState,
        actionType: UserActionType.VOTER_REGISTRATION,
      }
      return getClientModel({ ...sharedProps, ...voterRegistrationFields })
    },
    [UserActionType.LIVE_EVENT]: () => {
      return getClientModel({ ...sharedProps, actionType: UserActionType.LIVE_EVENT })
    },
    [UserActionType.TWEET_AT_PERSON]: () => {
      const { recipientDtsiSlug } = getRelatedModel(record, 'userActionTweetAtPerson')
      const tweetAtPersonFields: SensitiveDataClientUserActionTweetAtPerson = {
        recipientDtsiSlug,
        actionType: UserActionType.TWEET_AT_PERSON,
      }
      return getClientModel({ ...sharedProps, ...tweetAtPersonFields })
    },
    [UserActionType.RSVP_EVENT]: () => {
      const { eventSlug, eventState } = getRelatedModel(record, 'userActionRsvpEvent')
      const rsvpEventFields: SensitiveDataClientUserActionRsvpEvent = {
        eventSlug,
        eventState,
        actionType: UserActionType.RSVP_EVENT,
      }
      return getClientModel({ ...sharedProps, ...rsvpEventFields })
    },
    [UserActionType.VOTER_ATTESTATION]: () => {
      const { usaState } = getRelatedModel(record, 'userActionVoterAttestation')
      const voterAttestationFields: SensitiveDataClientUserActionVoterAttestation = {
        usaState,
        actionType: UserActionType.VOTER_ATTESTATION,
      }
      return getClientModel({ ...sharedProps, ...voterAttestationFields })
    },
    [UserActionType.VIEW_KEY_RACES]: () => {
      const { usaState, usCongressionalDistrict } = getRelatedModel(
        record,
        'userActionViewKeyRaces',
      )
      const keyRacesFields: SensitiveDataClientUserActionViewKeyRaces = {
        usaState,
        usCongressionalDistrict,
        actionType: UserActionType.VIEW_KEY_RACES,
      }
      return getClientModel({ ...sharedProps, ...keyRacesFields })
    },
    [UserActionType.VOTING_INFORMATION_RESEARCHED]: () => {
      const { addressId, address, shouldReceiveNotifications } = getRelatedModel(
        record,
        'userActionVotingInformationResearched',
      )
      const votingInformationResearchedFields: SensitiveDataClientUserActionVotingInformationResearched =
        {
          address: address ? getClientAddress(address) : null,
          addressId,
          shouldReceiveNotifications,
          actionType: UserActionType.VOTING_INFORMATION_RESEARCHED,
        }
      return getClientModel({ ...sharedProps, ...votingInformationResearchedFields })
    },
    [UserActionType.VOTING_DAY]: () => {
      const { votingYear } = getRelatedModel(record, 'userActionVotingDay')
      const votingDayFields: SensitiveDataClientUserActionVotingDay = {
        votingYear,
        actionType: UserActionType.VOTING_DAY,
      }
      return getClientModel({ ...sharedProps, ...votingDayFields })
    },
    [UserActionType.REFER]: () => {
      const { referralsCount } = getRelatedModel(record, 'userActionRefer')
      const referFields: SensitiveDataClientUserActionRefer = {
        referralsCount,
        actionType: UserActionType.REFER,
      }
      return getClientModel({ ...sharedProps, ...referFields })
    },
    [UserActionType.POLL]: () => {
      const { userActionPollAnswers } = getRelatedModel(record, 'userActionPoll')
      const pollFields: SensitiveDataClientUserActionPoll = {
        actionType: UserActionType.POLL,
        userActionPollAnswers: userActionPollAnswers.map(x => ({
          answer: x.answer,
          isOtherAnswer: x.isOtherAnswer,
          userActionCampaignName: x.userActionCampaignName,
        })),
      }
      return getClientModel({ ...sharedProps, ...pollFields })
    },
  }

  const getSensitiveDataClientUserActionFromActionType = actionTypes[actionType]

  if (!getSensitiveDataClientUserActionFromActionType) {
    throw new Error(`getSensitiveDataClientUserAction: no user action fk found for id ${id}`)
  }

  return getSensitiveDataClientUserActionFromActionType()
}
