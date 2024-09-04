'use client'
import React from 'react'
import { UserActionType } from '@prisma/client'

import { ClientUserAction } from '@/clientModels/clientUserAction/clientUserAction'
import { NextImage } from '@/components/ui/image'

const ACTIVITY_TYPE_TO_ICON_URL: Record<UserActionType, string> = {
  [UserActionType.DONATION]: '/activityFeedIcons/donate.svg',
  [UserActionType.NFT_MINT]: '/activityFeedIcons/donate.svg',
  [UserActionType.CALL]: '/activityFeedIcons/call.svg',
  [UserActionType.EMAIL]: '/activityFeedIcons/email.svg',
  [UserActionType.OPT_IN]: '/activityFeedIcons/join.svg',
  [UserActionType.VOTER_REGISTRATION]: '/activityFeedIcons/vote.svg',
  [UserActionType.VOTER_ATTESTATION]: '/activityFeedIcons/pledge.svg',
  [UserActionType.TWEET]: '/activityFeedIcons/share-x.svg',
  [UserActionType.LIVE_EVENT]: '/activityFeedIcons/event.svg',
  [UserActionType.TWEET_AT_PERSON]: '/activityFeedIcons/pizza-day.svg',
  [UserActionType.RSVP_EVENT]: '/activityFeedIcons/event-rsvp.svg',
  [UserActionType.VIEW_KEY_RACES]: '/activityFeedIcons/join.svg',
  [UserActionType.VOTING_INFORMATION_RESEARCHED]: '/activityFeedIcons/pledge.svg',
}

type ActivityAvatarProps = {
  actionType: ClientUserAction['actionType']
  size: number
}
export const ActivityAvatar = ({ size, actionType }: ActivityAvatarProps) => {
  return (
    <NextImage
      alt={actionType}
      height={size}
      src={ACTIVITY_TYPE_TO_ICON_URL[actionType]}
      style={{ width: size, height: size }}
      width={size}
    />
  )
}
