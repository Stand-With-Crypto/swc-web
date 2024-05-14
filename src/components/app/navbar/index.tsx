'use client'

import { useCallback } from 'react'
import { useBoolean } from 'react-use'
import { capitalize } from 'lodash-es'
import { Menu, X } from 'lucide-react'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { NavbarLoggedInButton } from '@/components/app/navbar/navbarLoggedInButton'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { useDialog } from '@/hooks/useDialog'
import { SupportedLocale } from '@/intl/locales'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

export function Navbar({ locale }: { locale: SupportedLocale }) {
  const dialogProps = useDialog({ analytics: 'Mobile Navbar' })
  const urls = getIntlUrls(locale)
  const leftLinks = [
    { href: urls.locationUnitedStates(), text: 'Key Races' },
    {
      href: urls.politiciansHomepage(),
      text: 'Politicians',
    },
    {
      href: urls.endorsedCandidates(),
      text: 'Endorsements',
    },
    {
      href: urls.about(),
      text: 'Mission',
    },
    {
      href: urls.partners(),
      text: 'Partners',
    },
    {
      href: urls.resources(),
      text: 'Resources',
    },
    {
      href: urls.donate(),
      text: 'Donate',
    },
  ]
  const maybeCloseAfterNavigating = useCallback(() => {
    if (dialogProps.open) {
      dialogProps.onOpenChange(false)
    }
  }, [dialogProps])

  const hasEnvironmentBar = NEXT_PUBLIC_ENVIRONMENT !== 'production'
  const loginButton = (
    <LoginDialogWrapper
      authenticatedContent={
        <NavbarLoggedInButton onOpenChange={open => open || maybeCloseAfterNavigating()} />
      }
    >
      <Button>Sign In</Button>
    </LoginDialogWrapper>
  )

  const [showBanner, closeBanner] = useBoolean(true)

  return (
    <>
      {hasEnvironmentBar && (
        <div className="flex h-10 items-center bg-yellow-300 text-center">
          <div className="container flex justify-between">
            <p className="flex-shrink-0 font-bold">
              {capitalize(NEXT_PUBLIC_ENVIRONMENT.toLowerCase())} Environment
            </p>
            <div className="xs:text-xs space-x-3 text-sm">
              <InternalLink className="text-fontcolor underline" href={urls.internalHomepage()}>
                Internal Pages
              </InternalLink>
            </div>
          </div>
        </div>
      )}

      {showBanner ? (
        <div className="relative bg-primary-cta py-4 lg:py-8">
          <div className="container grid items-center gap-6 lg:grid-cols-[1fr,auto,auto]">
            <div className="text-sm text-background max-md:text-center sm:text-base">
              <p className="font-bold">Tell your representatives to vote YES on FIT21</p>
              <p className="font-light">
                FIT21 is a crypto regulatory bill that could save crypto in America. Tell your
                representatives to vote YES.
              </p>
            </div>

            <UserActionFormEmailCongresspersonDialog>
              <Button className="max-md:w-full" variant="secondary">
                Send an Email
              </Button>
            </UserActionFormEmailCongresspersonDialog>

            <button className="justify-self-end rounded-full p-1 text-white transition-all hover:bg-gray-400 max-md:row-start-1">
              <X className="cursor-pointer" onClick={closeBanner} size={20} />
            </button>
          </div>
        </div>
      ) : null}

      <nav
        className={
          /*
          if a user has their font sizes set to something other than the browser default
          the size of our div'ws can shift which breaks UX that makes assumptions about how large these elements are
          like when we have a sub sticky header on the politician home page
          We need to hardcode the height of the navbar in different environments
          */
          cn(
            'sticky top-0 z-10 flex h-[72px] w-full items-center bg-white py-3 lg:h-[84px] lg:py-5',
          )
        }
      >
        <div className="container flex items-center justify-between">
          <InternalLink className="flex-shrink-0" href={urls.home()}>
            <NextImage
              alt={'Stand With Crypto Logo'}
              height={40}
              priority
              src="/logo/shield.svg"
              width={41}
            />
          </InternalLink>
          <div className="flex gap-4">
            <div className="flex gap-4 rounded-full bg-secondary">
              {leftLinks.map(({ href, text }) => {
                return (
                  <Button asChild className="hidden lg:block" key={href} variant="secondary">
                    <InternalLink href={href}>{text}</InternalLink>
                  </Button>
                )
              })}
            </div>

            <div className="hidden lg:flex">{loginButton}</div>
          </div>
        </div>
        <Drawer {...dialogProps} direction="top">
          <DrawerTrigger asChild>
            <button className="p-3 lg:hidden">
              <span className="sr-only">Open navigation menu</span>
              <Menu />
            </button>
          </DrawerTrigger>
          <DrawerContent direction="top">
            <div className="px-6 pb-6 pt-3 text-center">
              {leftLinks.map(({ href, text }) => {
                return (
                  <Button asChild className="block" key={href} variant="ghost">
                    <InternalLink href={href} onClick={maybeCloseAfterNavigating}>
                      {text}
                    </InternalLink>
                  </Button>
                )
              })}
              <div className="mt-4">{loginButton}</div>
            </div>
          </DrawerContent>
        </Drawer>
      </nav>
    </>
  )
}
