'use client'

import { Suspense } from 'react'

import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { useApiRecentActivity } from '@/hooks/useApiRecentActivity'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { RecentActivityList } from './recentActivityList'

export interface DynamicRecentActivityListProps {
  actions: PublicRecentActivity
  countryCode: SupportedCountryCodes
  pageSize: number
}

function DynamicRecentActivityListContent({
  actions: initialActions,
  countryCode,
  pageSize,
}: DynamicRecentActivityListProps) {
  const actions = useApiRecentActivity(initialActions, {
    limit: pageSize,
    countryCode: countryCode,
  }).data
  return <RecentActivityList actions={actions} />
}

export function DynamicRecentActivityList(props: DynamicRecentActivityListProps) {
  return (
    <Suspense fallback={<RecentActivityList actions={props.actions} />}>
      <DynamicRecentActivityListContent {...props} />
    </Suspense>
  )
}
