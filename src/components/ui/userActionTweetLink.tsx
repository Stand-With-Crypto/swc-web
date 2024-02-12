'use client'
import React from 'react'
import { UserActionType } from '@prisma/client'
import { Slot } from '@radix-ui/react-slot'

import { actionCreateUserActionTweet } from '@/actions/actionCreateUserActionTweet'
import { Button } from '@/components/ui/button'
import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'
import { triggerServerActionForForm } from '@/utils/web/formUtils'

export const UserActionTweetLink = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button> & {
    eventProperties?: AnalyticProperties
    message?: string
    url?: string
    asChild?: boolean
  }
>(
  (
    {
      asChild,
      message = 'I #standwithcrypto. So can you. Join standwithcrypto.org',
      url = 'https://www.standwithcrypto.org',
      eventProperties,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : Button
    return (
      <Comp
        onClick={() => {
          triggerServerActionForForm(
            {
              formName: 'User Action Tweet',
              analyticsProps: {
                ...eventProperties,
                'User Action Type': UserActionType.TWEET,
              },
            },
            () => actionCreateUserActionTweet(),
          )

          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(
              url,
            )}&text=${encodeURIComponent(message)}`,
            'Twitter',
            `noopener, width=550,height=400`,
          )
        }}
        ref={ref}
        {...props}
      />
    )
  },
)
UserActionTweetLink.displayName = 'TweetLink'
