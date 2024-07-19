'use client'

import Cookies from 'js-cookie'

import { Dialog, DialogContent, DialogProps, DialogTrigger } from '@/components/ui/dialog'
import { USER_COUNTRY_CODE_COOKIE_NAME } from '@/utils/server/getCountryCode'
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

  const userCountryCode = Cookies.get(USER_COUNTRY_CODE_COOKIE_NAME)

  if (!bypassCountryCheck && userCountryCode !== countryCode) {
    return (
      <Dialog {...dialogProps} analytics={ANALYTICS_NAME_USER_ACTION_FORM_UNAVAILABLE}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-w-3xl">
          <UserActionFormActionUnavailable onConfirm={() => dialogProps?.onOpenChange?.(false)} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl" padding={padding}>
        {children}
      </DialogContent>
    </Dialog>
  )
}
