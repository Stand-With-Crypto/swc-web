'use client'
import React from 'react'

import { USER_ACTION_PROPS_FOR_RECENT_ACTIVITY_ROW } from '@/components/app/recentActivityRow/constants'
import {
  RecentActivityRowBase,
  RecentActivityRowProps,
} from '@/components/app/recentActivityRow/recentActivityRow'
import { useIntlUrls } from '@/hooks/useIntlUrls'

export const VariantRecentActivityRow = function VariantRecentActivityRow(
  props: RecentActivityRowProps,
) {
  const { action, countryCode } = props
  const urls = useIntlUrls()

  const actionSpecificProps = USER_ACTION_PROPS_FOR_RECENT_ACTIVITY_ROW[action.actionType]({
    ...props,
    urls,
  })

  return (
    <RecentActivityRowBase action={action} countryCode={countryCode} {...actionSpecificProps} />
  )
}
