'use client'

import { Button, ButtonProps } from '@/components/ui/button'
import { useSession } from '@/hooks/useSession'
import { openWindow } from '@/utils/shared/openWindow'

interface MaybeDonateButtonProps extends ButtonProps {
  donationUrl: string
}

/**
 * `MaybeDonateButton` is a button that will only render if the user has opted in to membership
 * and a donation URL is provided.
 */
export function MaybeDonateButton(props: MaybeDonateButtonProps) {
  const { donationUrl, ...buttonProps } = props

  const { user } = useSession()

  if (!donationUrl || !user?.hasOptedInToMembership) return null

  return (
    <div className="sm:p-4">
      <Button
        // we can't have nested <a> tags so doing this the non-semantic way. We may want to further refactor the parent component to fix this later on
        className="sm:w-full"
        onClick={e => {
          e.preventDefault()
          openWindow(donationUrl)
        }}
        {...buttonProps}
      >
        Donate
      </Button>
    </div>
  )
}
