'use client'

import Link from 'next/link'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { ANALYTICS_NAME_USER_ACTION_VEW_KEY_PAGE } from '@/components/app/userActionFormViewKeyPage/constants'
import { useDialog } from '@/hooks/useDialog'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface UserActionViewKeyPageDialogProps {
  children: React.ReactNode
  countryCode: SupportedCountryCodes
  url: string
}

export function UserActionViewKeyPageDialog(props: UserActionViewKeyPageDialogProps) {
  const { children, countryCode, url } = props

  const dialogProps = useDialog({
    analytics: ANALYTICS_NAME_USER_ACTION_VEW_KEY_PAGE,
  })

  return (
    <GeoGate
      countryCode={countryCode}
      unavailableContent={
        <UserActionFormDialog {...dialogProps} countryCode={countryCode} trigger={children}>
          <UserActionFormActionUnavailable
            countryCode={countryCode}
            onConfirm={() => dialogProps.onOpenChange(false)}
          />
        </UserActionFormDialog>
      }
    >
      <Link className="w-full" href={url}>
        {children}
      </Link>
    </GeoGate>
  )
}
