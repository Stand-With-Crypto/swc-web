'use client'

import { Button, ButtonProps } from '@/components/ui/button'
import { ExternalLink } from '@/components/ui/link'
import { useSession } from '@/hooks/useSession'

interface MaybeDonateButtonProps extends ButtonProps {
  donationUrl: string
}

/**
 * `MaybeDonateButton` is a button that will only render if the user has opted in to membership.
 */
export function MaybeDonateButton(props: MaybeDonateButtonProps) {
  const { children, donationUrl, ...buttonProps } = props

  const { user } = useSession()

  if (!user?.hasOptedInToMembership) return null

  return (
    <Button asChild {...buttonProps}>
      <ExternalLink href={donationUrl}>{children || 'Donate'}</ExternalLink>
    </Button>
  )
}
