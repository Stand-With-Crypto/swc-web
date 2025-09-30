'use client'

import React from 'react'
import { useCopyToClipboard } from 'react-use'
import * as Sentry from '@sentry/nextjs'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { ClientUserCryptoAddressWithENSData } from '@/clientModels/clientUser/clientUserCryptoAddress'
import { UserAvatar } from '@/components/app/userAvatar'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { Skeleton } from '@/components/ui/skeleton'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useSessionControl } from '@/hooks/useSession'
import { useUserWithMaybeENSData } from '@/hooks/useUserWithMaybeEnsData'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { useTranslation } from '@/utils/web/i18n/useTranslation'
import { maybeEllipsisText } from '@/utils/web/maybeEllipsisText'
import {
  getFullSensitiveDataUserDisplayName,
  getSensitiveDataUserDisplayName,
} from '@/utils/web/userUtils'

interface NavbarLoggedInSessionPopoverContentProps {
  onClose: () => void
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      viewProfile: 'View profile',
      unlockRewards: 'Unlock rewards, track activities, and access exclusive membership tiers.',
      failedCopyToClipboard: 'Failed to copy to clipboard, try again later.',
      logOut: 'Log out',
      copiedToClipboard: 'Copied to clipboard',
    },
    de: {
      viewProfile: 'Profil ansehen',
      unlockRewards:
        'Belohnungen freischalten, Aktivitäten verfolgen und exklusive Mitgliedschaften zugänglich machen.',
      failedCopyToClipboard:
        'Fehler beim Kopieren in die Zwischenablage, versuchen Sie es später erneut.',
      logOut: 'Abmelden',
      copiedToClipboard: 'In die Zwischenablage kopiert',
    },
    fr: {
      viewProfile: 'Voir le profil',
      unlockRewards:
        'Débloquez les récompenses, suivez les activités et accédez aux niveaux de membre exclusifs.',
      failedCopyToClipboard:
        'Échec de la copie dans le presse-papiers, veuillez réessayer plus tard.',
      logOut: 'Se déconnecter',
      copiedToClipboard: 'Copié dans le presse-papiers',
    },
  },
})

export function NavbarLoggedInPopoverContent({
  onClose,
}: NavbarLoggedInSessionPopoverContentProps) {
  const { t } = useTranslation(i18nMessages, 'NavbarLoggedInPopoverContent')

  const urls = useIntlUrls()
  const { logout } = useSessionControl()

  const userWithMaybeEnsData = useUserWithMaybeENSData()

  return (
    <div className="space-y-2 text-left">
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center gap-4">
          {userWithMaybeEnsData ? (
            <UserHeading user={userWithMaybeEnsData} />
          ) : (
            <UserHeadingSkeleton />
          )}
        </div>

        <div className="space-y-1">
          <Button asChild className="w-full">
            <InternalLink href={urls.profile()} onClick={onClose}>
              {t('viewProfile')}
            </InternalLink>
          </Button>
          <p className="text-sm text-muted-foreground">{t('unlockRewards')}</p>
        </div>
      </div>

      <button
        className="block w-full border-t p-4 text-left text-sm font-medium hover:bg-secondary"
        onClick={async () => {
          await logout()
          onClose()
        }}
      >
        {t('logOut')}
      </button>
    </div>
  )
}

function UserHeading(props: {
  user: NonNullable<GetUserFullProfileInfoResponse['user']> & {
    primaryUserCryptoAddress: ClientUserCryptoAddressWithENSData | null
  }
}) {
  const { t } = useTranslation(i18nMessages, 'UserHeadingNavbarLoggedInPopoverContent')

  const user = props.user!
  const [{ error, value }, copyToClipboard] = useCopyToClipboard()

  const handleClipboardError = React.useCallback(() => {
    toast.error(t('failedCopyToClipboard'))
  }, [t])

  React.useEffect(() => {
    if (error) {
      Sentry.captureException(error)
      handleClipboardError()
    }
    if (value) {
      toast.success(t('copiedToClipboard'))
    }
  }, [error, value, handleClipboardError, t])
  const shouldDisplayCryptoAddress = !user.hasEmbeddedWallet
  const handleCopyNameToClipboard = React.useCallback(() => {
    const dataToWrite = getFullSensitiveDataUserDisplayName(user)
    if (!dataToWrite) {
      Sentry.captureMessage('Failed to copy to clipboard, no data to write', {
        user: { id: user.id },
      })
      return handleClipboardError()
    }

    copyToClipboard(dataToWrite)
  }, [user, handleClipboardError, copyToClipboard])

  return (
    <>
      <div className="flex-shrink-0">
        <UserAvatar size={36} user={user} />
      </div>
      {shouldDisplayCryptoAddress || !user.primaryUserEmailAddress ? (
        <div className="flex-1">
          <div className="flex w-full items-center justify-between">
            <p className="max-w-[150px] truncate">{getSensitiveDataUserDisplayName(user)}</p>
            <Button className="h-auto p-1" onClick={handleCopyNameToClipboard} variant="ghost">
              <Copy height={16} width={16} />
            </Button>
          </div>
          {user.primaryUserEmailAddress?.emailAddress && (
            <p className="text-ellipsis text-xs text-muted-foreground">
              {maybeEllipsisText(user.primaryUserEmailAddress?.emailAddress, 30)}
            </p>
          )}
        </div>
      ) : (
        <p className="truncate">{user.primaryUserEmailAddress.emailAddress}</p>
      )}
    </>
  )
}

function UserHeadingSkeleton() {
  return (
    <>
      <Skeleton className="h-9 w-9 rounded-full" />

      <Skeleton className="h-6 flex-1" />
    </>
  )
}
