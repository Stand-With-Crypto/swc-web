'use client'
import { MaybeAuthenticatedContent } from '@/components/app/authentication/maybeAuthenticatedContent'
import { ThirdwebLoginButton } from '@/components/app/authentication/thirdwebLoginButton'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useIntlUrls } from '@/hooks/useIntlUrls'

export function HeroCTA() {
  const profileReq = useApiResponseForUserFullProfileInfo()
  const urls = useIntlUrls()

  return (
    <MaybeAuthenticatedContent
      authenticatedContent={
        <Button asChild size="lg">
          <InternalLink href={urls.profile()}>View Your Profile</InternalLink>
        </Button>
      }
    >
      <ThirdwebLoginButton size="lg">
        {profileReq?.data?.user && !profileReq.data.user.primaryUserCryptoAddress
          ? 'Complete your profile'
          : 'Join the fight'}
      </ThirdwebLoginButton>
    </MaybeAuthenticatedContent>
  )
}
