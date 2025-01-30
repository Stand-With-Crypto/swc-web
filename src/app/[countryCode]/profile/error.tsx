'use client'

import { Button } from '@/components/ui/button'
import { MaybeNextImg } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useHandlePageError } from '@/hooks/useHandlePageError'
import { useIntlUrls } from '@/hooks/useIntlUrls'

export default function ProfileErrorPage({ error }: { error: Error & { digest?: string } }) {
  useHandlePageError({
    domain: 'profilePageError',
    humanReadablePageName: 'Profile',
    error,
  })

  const urls = useIntlUrls()

  return (
    <div className="container flex flex-grow flex-col items-center justify-center space-y-7">
      <MaybeNextImg alt="" height={120} src="/error_shield.svg" width={120} />
      <PageTitle size="sm">Maintenance in progress.</PageTitle>

      <PageSubTitle>Our systems are undergoing maintenance. Please try again later.</PageSubTitle>
      <Button asChild className="mr-3">
        <InternalLink href={urls.home()} replace>
          Go to home page
        </InternalLink>
      </Button>
    </div>
  )
}
