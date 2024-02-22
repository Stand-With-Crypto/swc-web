'use client'

import { useCookieConsent } from '@/components/app/cookieConsent/useCookieConsent'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function UserConfig() {
  const { resetCookieConsent } = useCookieConsent()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Label>Reset consent cookie:</Label>
        <Button
          onClick={() => {
            resetCookieConsent()

            // This is a hack to force the cookie consent banner to re-render from the layout
            window.location.reload()
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
