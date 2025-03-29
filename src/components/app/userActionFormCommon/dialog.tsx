'use client'

import { GeoGate } from '@/components/app/geoGate'
import { Dialog, DialogContent, DialogProps, DialogTrigger } from '@/components/ui/dialog'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

import { UserActionFormActionUnavailable } from './actionUnavailable'

interface UserActionFormDialogProps extends DialogProps {
  children: React.ReactNode
  trigger: React.ReactNode
  countryCode?: SupportedCountryCodes
  bypassCountryCheck?: boolean
  padding?: boolean
  className?: string
}

export const UserActionFormDialog = (props: UserActionFormDialogProps) => {
  const {
    children,
    trigger,
    countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE,
    bypassCountryCheck = false,
    padding = true,
    className,
    ...dialogProps
  } = props

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        a11yTitle=""
        aria-describedby={
          typeof dialogProps.analytics === 'string' ? dialogProps.analytics : undefined
        }
        className={cn('max-w-3xl', className)}
        padding={padding}
      >
        <GeoGate
          bypassCountryCheck={bypassCountryCheck}
          countryCode={countryCode}
          unavailableContent={
            <UserActionFormActionUnavailable
              countryCode={countryCode}
              onConfirm={() => dialogProps?.onOpenChange?.(false)}
            />
          }
        >
          {children}
        </GeoGate>
      </DialogContent>
    </Dialog>
  )
}
