'use client'

import { useCallback, useState } from 'react'
import Balancer from 'react-wrap-balancer'
import { AnimatePresence, motion } from 'framer-motion'
import { capitalize } from 'lodash-es'
import { Menu, X } from 'lucide-react'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { NavbarLoggedInButton } from '@/components/app/navbar/navbarLoggedInButton'
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
      href: urls.bills(),
      text: 'Bills',
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

  const [isSAB121ContentOpen, setIsSAB121ContentOpen] = useState(false)

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

      <div className="relative bg-primary-cta py-4 text-center">
        <div className="container flex flex-col items-center text-sm text-background antialiased max-sm:text-center sm:text-base">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            <InternalLink className="text-white" href="/bills/hjres109-118-US" replace>
              <p>
                <b>KEY VOTE H.J.RES.109: </b>
                SAB 121 VETO OVERRIDE
              </p>
            </InternalLink>

            <Button
              className={cn('max-sm:w-full lg:block', isSAB121ContentOpen && 'hidden')}
              onClick={() => setIsSAB121ContentOpen(oldState => !oldState)}
              size="sm"
              variant="secondary"
            >
              {isSAB121ContentOpen ? <X className="h-4 w-4" /> : 'Learn More'}
            </Button>
          </div>

          <AnimatePresence>
            {isSAB121ContentOpen && (
              <motion.div
                animate={{ opacity: 1, height: 'auto', paddingTop: '1rem' }}
                exit={{ opacity: 0, height: 0, paddingTop: 0 }}
                initial={{ opacity: 0, height: 0, paddingTop: 0 }}
                transition={{ ease: 'easeInOut' }}
              >
                <p className="text-sm font-normal tracking-normal">
                  <Balancer>
                    The House is voting on whether to override President Biden's veto of repealing
                    SAB 121, a bipartisan effort to allow banks to custody digital assets like they
                    would other assets.
                  </Balancer>
                </p>
                <p className="text-sm font-normal tracking-normal">
                  <Balancer>
                    In order to override the veto, the House needs a 2/3rds majority.
                  </Balancer>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isSAB121ContentOpen && (
              <motion.div
                animate={{ opacity: 1 }}
                className="mt-2 lg:hidden"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                transition={{ delay: 0.1, ease: 'easeIn' }}
              >
                <Button
                  onClick={() => setIsSAB121ContentOpen(oldState => !oldState)}
                  size="sm"
                  variant="secondary"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
          <DrawerTrigger asChild data-testid="drawer-trigger">
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
