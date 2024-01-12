'use client'

import React from 'react'
import { toast } from 'sonner'
import { Copy } from 'lucide-react'
import { useCopyToClipboard } from 'react-use'
import * as Sentry from '@sentry/nextjs'

import { Button } from '@/components/ui/button'
import { useThirdWeb } from '@/hooks/useThirdWeb'
import { InternalLink } from '@/components/ui/link'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { UserAvatar } from '@/components/app/userAvatar'
import {
  getFullSensitiveDataUserDisplayName,
  getSensitiveDataUserDisplayName,
} from '@/utils/web/userUtils'
import { Skeleton } from '@/components/ui/skeleton'
import { maybeEllipsisText } from '@/utils/web/maybeEllipsisText'
import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'

interface NavbarLoggedInSessionPopoverContentProps {
  onClose: () => void
  user?: GetUserFullProfileInfoResponse['user']
}

export function NavbarLoggedInSessionPopoverContent({
  onClose,
  user,
}: NavbarLoggedInSessionPopoverContentProps) {
  const urls = useIntlUrls()
  const { logoutAndDisconnect } = useThirdWeb()

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center gap-4">
          {user ? <UserHeading user={user} /> : <UserHeadingSkeleton />}
        </div>

        <div className="space-y-1">
          <Button className="w-full" asChild>
            <InternalLink href={urls.profile()} onClick={onClose}>
              View profile
            </InternalLink>
          </Button>
          <p className="text-sm text-muted-foreground">
            Unlock rewards, track activities, and access exclusive membership tiers.
          </p>
        </div>
      </div>

      <hr />
      <Button variant="link" onClick={logoutAndDisconnect}>
        Log out
      </Button>
    </div>
  )
}

function UserHeading(props: { user: GetUserFullProfileInfoResponse['user'] }) {
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
      <div className="min-w-[36px]">
        <UserAvatar user={user} size={36} />
      </div>
      <div className="flex-1">
        <div className="flex w-full items-center justify-between">
          <p>{getSensitiveDataUserDisplayName(user)}</p>
          <Button className="h-auto p-1" variant="ghost" onClick={handleCopyNameToClipboard}>
            <Copy width={16} height={16} />
          </Button>
        </div>
        {user.primaryUserEmailAddress?.address && (
          <p className="text-ellipsis text-xs text-muted-foreground">
            {maybeEllipsisText(user.primaryUserEmailAddress?.address, 30)}
          </p>
        )}
      </div>
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
