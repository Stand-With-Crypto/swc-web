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
import { useThirdwebData } from '@/hooks/useThirdwebData'
import { useUserWithMaybeENSData } from '@/hooks/useUserWithMaybeEnsData'
import { maybeEllipsisText } from '@/utils/web/maybeEllipsisText'
import {
  getFullSensitiveDataUserDisplayName,
  getSensitiveDataUserDisplayName,
} from '@/utils/web/userUtils'

interface NavbarLoggedInSessionPopoverContentProps {
  onClose: () => void
  user?: GetUserFullProfileInfoResponse['user']
}

export function NavbarLoggedInPopoverContent({
  onClose,
  user,
}: NavbarLoggedInSessionPopoverContentProps) {
  const urls = useIntlUrls()
  const { logoutAndDisconnect } = useThirdwebData()

  const userWithMaybeEnsData = useUserWithMaybeENSData({ user })

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
              View profile
            </InternalLink>
          </Button>
          <p className="text-sm text-muted-foreground">
            Unlock rewards, track activities, and access exclusive membership tiers.
          </p>
        </div>
      </div>

      <button
        className="block w-full border-t p-4 text-left text-sm font-medium hover:bg-secondary"
        onClick={async () => {
          await logoutAndDisconnect()
          onClose()
        }}
      >
        Log out
      </button>
    </div>
  )
}

function UserHeading(props: {
  user: NonNullable<GetUserFullProfileInfoResponse['user']> & {
    primaryUserCryptoAddress: ClientUserCryptoAddressWithENSData | null
  }
}) {
  const user = props.user!
  const [{ error, value }, copyToClipboard] = useCopyToClipboard()

  const handleClipboardError = React.useCallback(() => {
    toast.error('Failed to copy to clipboard, try again later.')
  }, [])

  React.useEffect(() => {
    if (error) {
      Sentry.captureException(error)
      handleClipboardError()
    }
    if (value) {
      toast.success('Copied to clipboard')
    }
  }, [error, value, handleClipboardError])
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
