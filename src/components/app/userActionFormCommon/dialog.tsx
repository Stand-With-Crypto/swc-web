'use client'

import { GeoGate } from '@/components/app/geoGate'
import { Dialog, DialogContent, DialogProps, DialogTrigger } from '@/components/ui/dialog'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

import { UserActionFormActionUnavailable } from './actionUnavailable'

const ANALYTICS_NAME_USER_ACTION_FORM_UNAVAILABLE = 'User Action Form Unavailable'

interface UserActionFormDialogProps extends DialogProps {
  children: React.ReactNode
  trigger: React.ReactNode
  countryCode?: string
  bypassCountryCheck?: boolean
  padding?: boolean
}

export const UserActionFormDialog = (props: UserActionFormDialogProps) => {
  const {
    children,
    trigger,
    countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE,
    bypassCountryCheck = false,
    padding = true,
    ...dialogProps
  } = props

  const unavailableContent = (
    <Dialog {...dialogProps} analytics={ANALYTICS_NAME_USER_ACTION_FORM_UNAVAILABLE}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <UserActionFormActionUnavailable onConfirm={() => dialogProps?.onOpenChange?.(false)} />
      </DialogContent>
    </Dialog>
  )

  return (
    <GeoGate
      bypassCountryCheck={bypassCountryCheck}
      countryCode={countryCode}
      unavailableContent={unavailableContent}
    >
      <Dialog {...dialogProps}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-w-3xl" padding={padding}>
          {children}
        </DialogContent>
      </Dialog>
    </GeoGate>
  )
}
