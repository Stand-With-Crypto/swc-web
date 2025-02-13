import { UserActionType } from '@prisma/client'

import {
  ClientUserAction,
  ClientUserActionCall,
  ClientUserActionDonation,
  ClientUserActionEmail,
  ClientUserActionLiveEvent,
  ClientUserActionNFTMint,
  ClientUserActionOptIn,
  ClientUserActionRefer,
  ClientUserActionRsvpEvent,
  ClientUserActionTweet,
  ClientUserActionTweetAtPerson,
  ClientUserActionViewKeyRaces,
  ClientUserActionVoterAttestation,
  ClientUserActionVoterRegistration,
  ClientUserActionVotingDay,
  ClientUserActionVotingInformationResearched,
} from '@/clientModels/clientUserAction/clientUserAction'

export const isCallAction = (
  action: ClientUserAction,
): action is ClientUserAction & ClientUserActionCall => {
  return action.actionType === UserActionType.CALL
}

export const isEmailAction = (
  action: ClientUserAction,
): action is ClientUserAction & ClientUserActionEmail => {
  return action.actionType === UserActionType.EMAIL
}

export const isDonationAction = (
  action: ClientUserAction,
): action is ClientUserAction & ClientUserActionDonation => {
  return action.actionType === UserActionType.DONATION
}

export const isNFTMintAction = (
  action: ClientUserAction,
): action is ClientUserAction & ClientUserActionNFTMint => {
  return action.actionType === UserActionType.NFT_MINT && action.nftMint !== null
}

export const isLiveEventAction = (
  action: ClientUserAction,
): action is ClientUserAction & ClientUserActionLiveEvent => {
  return action.actionType === UserActionType.LIVE_EVENT
}

export const isOptInAction = (
  action: ClientUserAction,
): action is ClientUserAction & ClientUserActionOptIn => {
  return action.actionType === UserActionType.OPT_IN
}

export const isTweetAction = (
  action: ClientUserAction,
): action is ClientUserAction & ClientUserActionTweet => {
  return action.actionType === UserActionType.TWEET
}

export const isVoterRegistrationAction = (
  action: ClientUserAction,
): action is ClientUserAction & ClientUserActionVoterRegistration => {
  return action.actionType === UserActionType.VOTER_REGISTRATION
}

export const isTweetAtPersonAction = (
  action: ClientUserAction,
): action is ClientUserAction & ClientUserActionTweetAtPerson => {
  return action.actionType === UserActionType.TWEET_AT_PERSON
}

export const isVoterAttestationAction = (
  action: ClientUserAction,
): action is ClientUserAction & ClientUserActionVoterAttestation => {
  return action.actionType === UserActionType.VOTER_ATTESTATION
}

export const isRsvpEventAction = (
  action: ClientUserAction,
): action is ClientUserAction & ClientUserActionRsvpEvent => {
  return action.actionType === UserActionType.RSVP_EVENT
}

export const isViewKeyRacesAction = (
  action: ClientUserAction,
): action is ClientUserAction & ClientUserActionViewKeyRaces => {
  return action.actionType === UserActionType.VIEW_KEY_RACES
}

export const isVotingInformationResearchedAction = (
  action: ClientUserAction,
): action is ClientUserAction & ClientUserActionVotingInformationResearched => {
  return action.actionType === UserActionType.VOTING_INFORMATION_RESEARCHED
}

export const isVotingDayAction = (
  action: ClientUserAction,
): action is ClientUserAction & ClientUserActionVotingDay => {
  return action.actionType === UserActionType.VOTING_DAY
}

export const isReferAction = (
  action: ClientUserAction,
): action is ClientUserAction & ClientUserActionRefer => {
  return action.actionType === UserActionType.REFER
}
