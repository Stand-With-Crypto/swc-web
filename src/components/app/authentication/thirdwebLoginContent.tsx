'use client'
import React from 'react'
import { ConnectEmbed, ConnectEmbedProps } from '@thirdweb-dev/react'
import { noop } from 'lodash'
import { useRouter } from 'next/navigation'
import { Arguments, useSWRConfig } from 'swr'

import { Dialog, DialogContent, DialogProps, DialogTrigger } from '@/components/ui/dialog'
import { NextImage } from '@/components/ui/image'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useDialog } from '@/hooks/useDialog'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { apiUrls } from '@/utils/shared/urls'
import { theme } from '@/utils/web/thirdweb/theme'

export function ThirdwebLoginDialog({
  children,
  onLogin = noop,
  ...props
}: Omit<DialogProps, 'analytics'> & {
  analytics?: DialogProps['analytics']
  children: React.ReactNode
  onLogin?: () => void
}) {
  const dialogProps = useDialog({ analytics: 'Login' })
  const router = useRouter()
  const { mutate } = useSWRConfig()

  return (
    <Dialog {...dialogProps} {...props}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-l w-full">
        <ThirdwebLoginContent
          auth={{
            onLogin: () => {
              // ensure that any server components on the page that's being used are refreshed with the context the user is now logged in
              router.refresh()
              dialogProps.onOpenChange(false)
              onLogin()

              // These are keys which the mutation occurs on login
              // If we reset the cache we can have a situation where the value goes from `value => undefined => value`
              const excludedKeysFromCacheReset: Arguments[] = [apiUrls.userFullProfileInfo()]

              // There are a bunch of SWR queries that might show stale unauthenticated data unless we clear the cache.
              // This ensures we refetch using the users authenticated state
              // https://swr.vercel.app/docs/advanced/cache#modify-the-cache-data
              mutate(arg => !excludedKeysFromCacheReset.includes(arg), undefined, {
                revalidate: true,
              })
            },
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

export function ThirdwebLoginContent(props: ConnectEmbedProps) {
  const urls = useIntlUrls()

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
            <PageTitle size="sm">Join Stand With Crypto</PageTitle>
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
  return (
    <ConnectEmbed
      showThirdwebBranding={false}
      style={{ border: 'none', maxWidth: 'unset' }}
      theme={theme}
      {...props}
    />
  )
}
