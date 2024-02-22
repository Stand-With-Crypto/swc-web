'use client'
import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useIntlUrls } from '@/hooks/useIntlUrls'

export function HeroCTA() {
  const profileReq = useApiResponseForUserFullProfileInfo()
  const urls = useIntlUrls()

  return (
    <LoginDialogWrapper
      authenticatedContent={
        <Button asChild size="lg">
          <InternalLink href={urls.profile()}>
            {profileReq?.data?.user && !profileReq.data.user.primaryUserCryptoAddress
              ? 'View Profile'
              : 'Finish your profile'}
          </InternalLink>
        </Button>
      }
      loadingFallback={
        <Button disabled size="lg">
          Join the fight
        </Button>
      }
    >
      <Button size="lg">Join the fight</Button>
    </LoginDialogWrapper>
  )
}
