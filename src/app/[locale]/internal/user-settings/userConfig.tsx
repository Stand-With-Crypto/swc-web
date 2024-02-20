'use client'

import { QuestionMarkCircledIcon } from '@radix-ui/react-icons'

import { setHasSeenCompleteProfilePrompt } from '@/components/app/authentication/hasSeenCompleteProfilePrompt'
import { useCookieConsent } from '@/components/app/cookieConsent/useCookieConsent'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useThirdwebData } from '@/hooks/useThirdwebData'

export function UserConfig() {
  const { resetCookieConsent } = useCookieConsent()
  const { logoutAndDisconnect } = useThirdwebData()

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

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Label>Reset the complete profile prompt after login:</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="mx-auto block" style={{ height: 35 }}>
                <QuestionMarkCircledIcon />
              </TooltipTrigger>
              <TooltipContent className="prose max-w-xs">
                <ol>
                  <li>This will log you out</li>
                  <li>You'll also need to reset the db or remove the user you will log in</li>
                </ol>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Button
          onClick={() => {
            logoutAndDisconnect()
            setHasSeenCompleteProfilePrompt(false)

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
