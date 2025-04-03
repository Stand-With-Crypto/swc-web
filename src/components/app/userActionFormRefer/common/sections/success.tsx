'use client'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/ui/pageTitleText'

interface SuccessProps {
  onClose?: () => void
}

export function SuccessSection({ onClose }: SuccessProps) {
  return (
    <UserActionFormLayout className="min-h-max">
      <UserActionFormLayout.Container className="h-auto items-center justify-around">
        <div className="flex flex-col gap-4 text-center">
          <PageTitle size="sm">Thanks for referring friends!</PageTitle>

          <p className="text-fontcolor-muted">
            Your support helps grow our community and strengthens our voice on Capitol Hill.
          </p>
        </div>

        <Button className="w-full" onClick={onClose} size="lg" variant="primary-cta">
          Close
        </Button>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
