'use client'
import React from 'react'
import { UserActionType } from '@prisma/client'
import { Slot } from '@radix-ui/react-slot'

import { actionCreateUserActionTweet } from '@/actions/actionCreateUserActionTweet'
import { Button } from '@/components/ui/button'
import { TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME } from '@/utils/shared/constants'
import { openWindow } from '@/utils/shared/openWindow'
import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'
import { fullUrl } from '@/utils/shared/urls'
import { createTweetLink } from '@/utils/web/createTweetLink'
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
      message = `I #StandWithCrypto. More than ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} people are already advocating for better crypto policy in America. Join the fight to receive email updates on crypto policy, invites to local events, and more.`,
      url = fullUrl(
        '/action/sign-up?utm_source=twitter&utm_medium=social&utm_campaign=user-action-tweet',
      ),
      eventProperties,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : Button
    return (
      <Comp
        onClick={() => {
          void triggerServerActionForForm(
            {
              formName: 'User Action Tweet',
              analyticsProps: {
                ...eventProperties,
                'User Action Type': UserActionType.TWEET,
              },
              payload: undefined,
            },
            () => actionCreateUserActionTweet(),
          )

          openWindow(createTweetLink({ url, message }), 'Twitter', `noopener, width=550,height=400`)
        }}
        ref={ref}
        {...props}
      />
    )
  },
)
UserActionTweetLink.displayName = 'TweetLink'
