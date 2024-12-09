'use client'

import { GeoGate } from '@/components/app/geoGate'
import { Dialog, DialogContent, DialogProps, DialogTrigger } from '@/components/ui/dialog'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

import { UserActionFormActionUnavailable } from './actionUnavailable'

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

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        a11yTitle="user-action-form-dialog-content"
        aria-describedby="user-action-form-dialog-content"
        className="max-w-3xl"
        padding={padding}
      >
        <GeoGate
          bypassCountryCheck={bypassCountryCheck}
          countryCode={countryCode}
          unavailableContent={
            <UserActionFormActionUnavailable onConfirm={() => dialogProps?.onOpenChange?.(false)} />
          }
        >
          {children}
        </GeoGate>
      </DialogContent>
    </Dialog>
  )
}
