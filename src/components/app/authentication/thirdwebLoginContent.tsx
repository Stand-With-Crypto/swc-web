'use client'
import React from 'react'
import { ConnectEmbed, ConnectEmbedProps } from '@thirdweb-dev/react'
import { useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'

import { Dialog, DialogContent, DialogProps, DialogTrigger } from '@/components/ui/dialog'
import { NextImage } from '@/components/ui/image'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useAuthUser } from '@/hooks/useAuthUser'
import { useDialog } from '@/hooks/useDialog'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { theme } from '@/utils/web/thirdweb/theme'

export function ThirdwebLoginDialog({
  children,
  ...props
}: Omit<DialogProps, 'analytics'> & {
  analytics?: DialogProps['analytics']
  children: React.ReactNode
}) {
  const dialogProps = useDialog({ analytics: 'Login' })
  const router = useRouter()

  const user = useAuthUser()
  console.log({ user })
  const { mutate } = useSWRConfig()

  return (
    <Dialog {...dialogProps} {...props}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-l w-full">
        <ThirdwebLoginContent
          auth={{
            onLogin: () => {
              // ensure that any server components on the page that's being used are refreshed with the context the user is now logged in
              // router.refresh()
              // dialogProps.onOpenChange(false)

              // There are a bunch of SWR queries that might show stale unauthenticated data unless we clear the cache.
              // This ensures we refetch using the users authenticated state
              // https://swr.vercel.app/docs/advanced/cache#modify-the-cache-data
              mutate(() => true, undefined, { revalidate: true })
            },
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

export function ThirdwebLoginContent(props: ConnectEmbedProps) {
  const urls = useIntlUrls()
  const profileReq = useApiResponseForUserFullProfileInfo()
  return (
    <div>
      <div className="mx-auto flex max-w-[460px] flex-col items-center gap-8">
        <div className="flex flex-col items-center space-y-6">
          <NextImage
            alt="Stand With Crypto Logo"
            height={80}
            priority
            src="/logo/shield.svg"
            width={80}
          />

          <div className="space-y-4">
            <PageTitle size="sm">
              {profileReq?.data?.user && !profileReq.data.user.primaryUserCryptoAddress
                ? 'Complete your profile'
                : 'Join Stand With Crypto'}
            </PageTitle>
            <PageSubTitle size="sm">
              Lawmakers and regulators are threatening the crypto industry. You can fight back and
              ask for sensible rules. Join the Stand with Crypto movement to make your voice heard
              in Washington D.C.
            </PageSubTitle>
          </div>
        </div>

        <ThirdwebLoginEmbedded {...props} />

        <p className="text-center text-xs text-muted-foreground">
          By signing up, I understand that Stand With Crypto and its vendors may collect and use my
          Personal Information. To learn more, visit the{' '}
          <InternalLink className="text-blue-600" href={urls.privacyPolicy()} target="_blank">
            Stand With Crypto Alliance Privacy Policy
          </InternalLink>{' '}
          and{' '}
          <ExternalLink
            className="text-blue-600"
            href="https://www.quorum.us/static/Privacy-Policy.pdf"
          >
            Quorum Privacy Policy
          </ExternalLink>
        </p>
      </div>
    </div>
  )
}

function ThirdwebLoginEmbedded(props: ConnectEmbedProps) {
  return <ConnectEmbed style={{ border: 'none', maxWidth: 'unset' }} theme={theme} {...props} />
}
