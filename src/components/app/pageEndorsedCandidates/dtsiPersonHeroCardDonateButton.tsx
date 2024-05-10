'use client'

import { Button } from '@/components/ui/button'
import { openWindow } from '@/utils/shared/openWindow'

export function DTSIPersonHeroCardDonateButton({ donationUrl }: { donationUrl: string }) {
  return (
    <div className="sm:p-4">
      <Button
        // we can't have nested <a> tags so doing this the non-semantic way. We may want to further refactor the parent component to fix this later on
        className="sm:w-full"
        onClick={e => {
          e.preventDefault()
          openWindow(donationUrl)
        }}
        variant="secondary"
      >
        Donate
      </Button>
    </div>
  )
}
