'use client'
import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useIntlUrls } from '@/hooks/useIntlUrls'

export function HeroCTA() {
  const profileReq = useApiResponseForUserFullProfileInfo()
  const urls = useIntlUrls()

  const unauthenticatedContent = <Button size="lg">Join the fight</Button>
  const authenticatedButtonLabel =
    profileReq?.data?.user && !profileReq.data.user.primaryUserCryptoAddress
      ? 'View Profile'
      : 'Finish your profile'
  return (
    <LoginDialogWrapper
      authenticatedContent={
        profileReq.data?.user ? (
          <Button asChild size="lg">
            <InternalLink href={urls.profile()}>{authenticatedButtonLabel}</InternalLink>
          </Button>
        ) : (
          unauthenticatedContent
        )
      }
      loadingFallback={unauthenticatedContent}
    >
      {unauthenticatedContent}
    </LoginDialogWrapper>
  )
}
