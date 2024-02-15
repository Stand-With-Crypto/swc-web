'use client'

import { useCookieConsent } from '@/components/app/cookieConsent/useCookieConsent'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useThirdwebData } from '@/hooks/useThirdwebData'
import { setLocalUserPersistedValues } from '@/utils/web/clientLocalUser'

export default function CookieConsentConfig() {
  const { resetCookieConsent } = useCookieConsent()
  const { logoutAndDisconnect } = useThirdwebData()

  return (
    <div className="flex flex-col gap-4">
      <PageTitle as="h2" className="text-start" size="sm">
        Cookies
      </PageTitle>
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

      <div className="flex items-center gap-4">
        <Label>
          Reset <pre>hasSeenCompleteProfilePrompt</pre> on local persisted user (you will need to
          remove the user from the db):
        </Label>
        <Button
          onClick={() => {
            setLocalUserPersistedValues({ hasSeenCompleteProfilePrompt: false })
            logoutAndDisconnect()

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
