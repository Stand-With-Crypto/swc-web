'use client'
import { MaybeAuthenticatedContent } from '@/components/app/authentication/maybeAuthenticatedContent'
import { ThirdwebLoginDialog } from '@/components/app/authentication/thirdwebLoginContent'
import { NavbarLoggedInButton } from '@/components/app/navbar/navbarLoggedInButton'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { useDialog } from '@/hooks/useDialog'
import { SupportedLocale } from '@/intl/locales'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { getIntlUrls } from '@/utils/shared/urls'
import { Menu } from 'lucide-react'
import _ from 'lodash'
import { useCallback } from 'react'

export function Navbar({ locale }: { locale: SupportedLocale }) {
  const dialogProps = useDialog({ analytics: 'Mobile Navbar' })
  const urls = getIntlUrls(locale)
  const leftLinks = [
    {
      href: urls.about(),
      text: 'Mission',
    },
    {
      href: urls.leaderboard(),
      text: 'Our Community',
    },
    {
      href: urls.politiciansHomepage(),
      text: 'Politicians',
    },
    {
      href: urls.resources(),
      text: 'Resources',
    },
  ]
  const maybeCloseAfterNavigating = useCallback(() => {
    if (dialogProps.open) {
      dialogProps.onOpenChange(false)
    }
  }, [dialogProps])
  return (
    <>
      {NEXT_PUBLIC_ENVIRONMENT !== 'production' && (
        <div className="bg-yellow-300 py-3 text-center">
          <div className="container flex justify-between">
            <p className="flex-shrink-0 font-bold">
              {_.capitalize(NEXT_PUBLIC_ENVIRONMENT.toLowerCase())} Environment
            </p>
            <div className="xs:text-xs space-x-3 text-sm">
              <InternalLink className="underline" href={urls.internalHomepage()}>
                Internal Pages
              </InternalLink>
            </div>
          </div>
        </div>
      )}
      <nav className="container flex justify-between py-3 md:py-8">
        <div className="flex items-center gap-8">
          <InternalLink className="flex-shrink-0" href={urls.home()}>
            <NextImage
              alt={'Stand With Crypto Logo'}
              height={40}
              priority
              src="/logo/shield.svg"
              width={41}
            />
          </InternalLink>
          {leftLinks.map(({ href, text }) => {
            return (
              <InternalLink className="hidden text-gray-800 md:block" href={href} key={href}>
                {text}
              </InternalLink>
            )
          })}
        </div>
        <Drawer {...dialogProps} direction="top">
          <DrawerTrigger asChild>
            <button className="py-3 pl-3 md:hidden">
              <span className="sr-only">Open navigation menu</span>
              <Menu />
            </button>
          </DrawerTrigger>
          <DrawerContent direction="top">
            <div className="space-y-6 px-6 pb-6 pt-3 text-center md:space-y-8">
              {leftLinks.map(({ href, text }) => {
                return (
                  <InternalLink
                    className="block font-bold text-gray-800"
                    href={href}
                    key={href}
                    onClick={maybeCloseAfterNavigating}
                  >
                    {text}
                  </InternalLink>
                )
              })}
              <div>
                <Button asChild className="mr-3">
                  <InternalLink href={urls.donate()}>Donate</InternalLink>
                </Button>
              </div>
              <div>
                <MaybeAuthenticatedContent
                  authenticatedContent={
                    <NavbarLoggedInButton
                      onOpenChange={open => open || maybeCloseAfterNavigating()}
                    />
                  }
                >
                  <ThirdwebLoginDialog>
                    <Button variant="secondary">Log In</Button>
                  </ThirdwebLoginDialog>
                </MaybeAuthenticatedContent>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <div className="hidden md:flex">
          <Button asChild className="mr-3">
            <InternalLink href={urls.donate()}>Donate</InternalLink>
          </Button>
          <MaybeAuthenticatedContent
            authenticatedContent={
              <NavbarLoggedInButton onOpenChange={open => open || maybeCloseAfterNavigating()} />
            }
          >
            <ThirdwebLoginDialog>
              <Button variant="secondary">Log In</Button>
            </ThirdwebLoginDialog>
          </MaybeAuthenticatedContent>
        </div>
      </nav>
    </>
  )
}
