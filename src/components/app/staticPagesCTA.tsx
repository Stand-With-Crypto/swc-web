'use client'

import { MaybeAuthenticatedContent } from '@/components/app/authentication/maybeAuthenticatedContent'
import { ThirdwebLoginDialog } from '@/components/app/authentication/thirdwebLoginContent'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { useIntlUrls } from '@/hooks/useIntlUrls'

export function StaticPagesCTA() {
  const urls = useIntlUrls()
  return (
    <div className="w-full max-w-full">
      <div className="flex items-center justify-between gap-32">
        <div className="max-w-md">
          <p className="prose-lg my-4 font-semibold">
            If you've made it this far, you should really call your Congressperson
          </p>
          <p className="m-0 text-muted-foreground">Don't worry, we'll show you how</p>
        </div>
        <MaybeAuthenticatedContent
          authenticatedContent={
            <Button asChild size="lg">
              <InternalLink href={urls.profile()}>View Profile</InternalLink>
            </Button>
          }
        >
          <ThirdwebLoginDialog>
            <Button>GET STARTED</Button>
          </ThirdwebLoginDialog>
        </MaybeAuthenticatedContent>
      </div>
    </div>
  )
}
