'use client'
import React from 'react'
import { motion } from 'motion/react'

import { ClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { ClientUserAction } from '@/clientModels/clientUserAction/clientUserAction'
import { ActivityAvatar } from '@/components/app/recentActivityRow/activityAvatar'
import { FormattedRelativeDatetimeWithClientHydration } from '@/components/ui/formattedRelativeDatetimeWithClientHydration'
import { useIsMobile } from '@/hooks/useIsMobile'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface RecentActivityRowProps {
  action: ClientUserAction & { user: ClientUserWithENSData }
  countryCode: SupportedCountryCodes
}

export function RecentActivityRowBase({
  countryCode,
  action,
  children,
  onFocusContent,
}: RecentActivityRowProps & { children: React.ReactNode; onFocusContent?: () => React.ReactNode }) {
  const [hasFocus, setHasFocus] = React.useState(false)
  const isMobile = useIsMobile({ defaultState: true })
  return (
    <div
      // added min height to prevent height shifting on hover
      className="flex min-h-[41px] items-center justify-between gap-5"
      onMouseEnter={() => isMobile || setHasFocus(true)}
      onMouseLeave={() => isMobile || setHasFocus(false)}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <ActivityAvatar actionType={action.actionType} size={44} />
        </div>
        <div>{children}</div>
      </div>
      <div className="shrink-0 text-xs text-gray-500 lg:text-base">
        {hasFocus && onFocusContent ? (
          <motion.div
            animate={{ opacity: 1, transform: 'translateX(0)' }}
            initial={{ opacity: 0, transform: 'translateX(10px)' }}
            transition={{ duration: 0.5 }}
          >
            {onFocusContent()}
          </motion.div>
        ) : (
          <>
            <span className="hidden md:inline">
              <FormattedRelativeDatetimeWithClientHydration
                countryCode={countryCode}
                date={new Date(action.datetimeCreated)}
              />
            </span>
            <span className="inline md:hidden">
              <FormattedRelativeDatetimeWithClientHydration
                countryCode={countryCode}
                date={new Date(action.datetimeCreated)}
                timeFormatStyle="narrow"
              />
            </span>
          </>
        )}
      </div>
    </div>
  )
}
