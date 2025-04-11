'use client'
import React from 'react'
import { motion } from 'motion/react'

import { ClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { ClientUserAction } from '@/clientModels/clientUserAction/clientUserAction'
import { ActivityAvatar } from '@/components/app/recentActivityRow/activityAvatar'
import { FormattedRelativeDatetime } from '@/components/ui/formattedRelativeDatetime'
import { Skeleton } from '@/components/ui/skeleton'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useIsMobile } from '@/hooks/useIsMobile'
import { COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX } from '@/utils/shared/intl/displayNames'
import { getStateNameResolver } from '@/utils/shared/stateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

export interface RecentActivityRowProps {
  action: ClientUserAction & { user: ClientUserWithENSData }
  countryCode: SupportedCountryCodes
}

export function RecentActivityRowBase({
  countryCode,
  action,
  children,
  onFocusContent: OnFocusContent,
}: RecentActivityRowProps & { children: React.ReactNode; onFocusContent?: React.ComponentType }) {
  const [hasFocus, setHasFocus] = React.useState(false)
  const isMobile = useIsMobile({ defaultState: true })
  return (
    <div
      // added min height to prevent height shifting on hover
      className="flex min-h-[41px] items-center gap-4"
      onMouseEnter={() => isMobile || setHasFocus(true)}
      onMouseLeave={() => isMobile || setHasFocus(false)}
    >
      <div className="flex-shrink-0">
        <ActivityAvatar actionType={action.actionType} size={44} />
      </div>

      <div
        className={cn('flex w-full flex-col justify-between gap-1.5 sm:flex-row sm:items-center', {
          'flex-row': hasFocus,
        })}
      >
        <div>{children}</div>
        <div className="shrink-0 text-xs text-gray-500 lg:text-base">
          {hasFocus && OnFocusContent ? (
            <motion.div
              animate={{ opacity: 1, transform: 'translateX(0)' }}
              initial={{ opacity: 0, transform: 'translateX(10px)' }}
              transition={{ duration: 0.5 }}
            >
              <OnFocusContent />
            </motion.div>
          ) : (
            <ActionAdditionalInfo action={action} countryCode={countryCode} />
          )}
        </div>
      </div>
    </div>
  )
}

interface ActionAdditionalInfoProps {
  action: RecentActivityRowProps['action']
  countryCode: SupportedCountryCodes
}

function ActionAdditionalInfo({ action, countryCode }: ActionAdditionalInfoProps) {
  const hasHydrated = useHasHydrated()
  if (!hasHydrated) {
    return <Skeleton>a while ago</Skeleton>
  }

  // TODO: Change this to a prop instead of hardcoded based on the countryCode
  if (countryCode !== SupportedCountryCodes.US) {
    const { administrativeAreaLevel1, countryCode: userLocationCountryCode } =
      action.user.userLocationDetails ?? {}
    const hasUserChangedLocationSinceActionCompleted =
      userLocationCountryCode?.toLowerCase() !== countryCode

    if (!administrativeAreaLevel1 || hasUserChangedLocationSinceActionCompleted) {
      return <span>From {COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX[countryCode]}</span>
    }

    const stateNameResolver = getStateNameResolver(countryCode)
    const stateName = stateNameResolver(administrativeAreaLevel1)

    return <span>From {stateName ?? administrativeAreaLevel1}</span>
  }

  return (
    <>
      <span className="hidden md:inline">
        <FormattedRelativeDatetime
          countryCode={countryCode}
          date={new Date(action.datetimeCreated)}
        />
      </span>
      <span className="inline md:hidden">
        <FormattedRelativeDatetime
          countryCode={countryCode}
          date={new Date(action.datetimeCreated)}
          timeFormatStyle="narrow"
        />
      </span>
    </>
  )
}
