'use client'

import { useCallback, useMemo, useState } from 'react'
import { useEvent } from 'react-use'

import { Button } from '@/components/ui/button'
import { useResponsivePopover } from '@/components/ui/responsivePopover'
import { useDialog } from '@/hooks/useDialog'
import { useUserWithMaybeENSData } from '@/hooks/useUserWithMaybeEnsData'
import { LOGOUT_ACTION_EVENT } from '@/utils/shared/eventListeners'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { useTranslation } from '@/utils/web/i18n/useTranslation'
import { getSensitiveDataUserDisplayName } from '@/utils/web/userUtils'

import { NavbarLoggedInPopoverContent } from './navbarLoggedInPopoverContent'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      profile: 'Profile',
      loggingOut: 'Logging out...',
      signIn: 'Sign In',
      userProfile: 'User Profile',
    },
    de: {
      profile: 'Profil',
      loggingOut: 'Abmelden...',
      signIn: 'Anmelden',
      userProfile: 'Benutzerprofil',
    },
    fr: {
      profile: 'Profil',
      loggingOut: 'Déconnexion...',
      signIn: 'Se connecter',
      userProfile: 'Profil utilisateur',
    },
  },
})

export function NavbarLoggedInButton({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation(i18nMessages, 'NavbarLoggedInButton')

  const { Popover, PopoverContent, PopoverTrigger } = useResponsivePopover()
  const dialogProps = useDialog({ analytics: 'Navbar Logged In Button' })
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const userWithMaybeEnsData = useUserWithMaybeENSData()

  const displayName = useMemo(() => {
    if (!userWithMaybeEnsData) return null

    const hasUserProvidedInfo =
      userWithMaybeEnsData.firstName || userWithMaybeEnsData.primaryUserEmailAddress?.emailAddress
    if (!hasUserProvidedInfo) {
      return t('profile')
    }

    return getSensitiveDataUserDisplayName(userWithMaybeEnsData)
  }, [userWithMaybeEnsData, t])

  const handleLogoutEvent = useCallback(() => {
    setIsLoggingOut(oldState => !oldState)
  }, [])

  // This is used to disable the login button while logging out
  useEvent(LOGOUT_ACTION_EVENT, handleLogoutEvent, window, { capture: true })

  const buttonWidthClassName = 'w-full min-[1096px]:w-auto'
  return (
    <Popover
      {...dialogProps}
      onOpenChange={open => {
        if (!displayName) {
          return
        }
        dialogProps.onOpenChange(open)
        onOpenChange?.(open)
      }}
    >
      <PopoverTrigger asChild disabled={isLoggingOut}>
        {isLoggingOut ? (
          <Button className={buttonWidthClassName} disabled>
            {t('loggingOut')}
          </Button>
        ) : displayName ? (
          <Button className={buttonWidthClassName} data-testid="login-button">
            <div className="max-w-[150px] truncate">{displayName}</div>
          </Button>
        ) : (
          <Button className={buttonWidthClassName} data-testid="login-button">
            {t('signIn')}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent a11yTitle={t('userProfile')} align="end" className="p-0">
        <NavbarLoggedInPopoverContent onClose={() => dialogProps.onOpenChange(false)} />
      </PopoverContent>
    </Popover>
  )
}
