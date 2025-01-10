'use client'

import { useCallback, useState } from 'react'
import { useIsPreviewing } from '@builder.io/react'
import { Cross1Icon } from '@radix-ui/react-icons'
import { capitalize } from 'lodash-es'
import { ChevronDown, Menu } from 'lucide-react'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import {
  AdvocacyToolkitIcon,
  BillsIcon,
  CommunityIcon,
  CreatorDefenseIcon,
  DonateIcon,
  MissionIcon,
  PartnersIcon,
  PressIcon,
} from '@/components/app/navbar/navbarDrawerIcons'
import { NavbarLoggedInButton } from '@/components/app/navbar/navbarLoggedInButton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { useDialog } from '@/hooks/useDialog'
import { SupportedLocale } from '@/intl/locales'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

export function Navbar({ locale }: { locale: SupportedLocale }) {
  const dialogProps = useDialog({ analytics: 'Mobile Navbar' })
  const isPreviewing = useIsPreviewing()
  const urls = getIntlUrls(locale)
  const [hoveredMenuIndex, setHoveredMenuIndex] = useState<number | null>(null)
  const [openAccordionTitle, setOpenAccordionTitle] = useState<string | undefined>()

  const leftLinks = [
    {
      href: urls.politiciansHomepage(),
      text: 'Politician scores',
    },
    {
      href: urls.events(),
      text: 'Events',
    },
    {
      text: 'Resources',
      children: [
        {
          href: urls.donate(),
          text: 'Donate',
          icon: DonateIcon,
        },
        {
          href: urls.about(),
          text: 'Our mission',
          icon: MissionIcon,
        },
        {
          href: urls.community(),
          text: 'Community',
          icon: CommunityIcon,
        },
        {
          href: urls.partners(),
          text: 'Partners',
          icon: PartnersIcon,
        },
        {
          href: urls.bills(),
          text: 'Bills',
          icon: BillsIcon,
        },
        {
          href: urls.creatorDefenseFund(),
          text: 'Creator Defense Fund',
          icon: CreatorDefenseIcon,
        },
        {
          href: urls.advocacyToolkit(),
          text: 'Advocacy toolkit',
          icon: AdvocacyToolkitIcon,
        },

        {
          href: urls.press(),
          text: 'Press',
          icon: PressIcon,
        },
      ],
    },
  ]

  const maybeCloseAfterNavigating = useCallback(() => {
    if (dialogProps.open) {
      dialogProps.onOpenChange(false)
    }
  }, [dialogProps])

  const hasEnvironmentBar = NEXT_PUBLIC_ENVIRONMENT !== 'production' && !isPreviewing
  const LoginButton = () => (
    <LoginDialogWrapper
      authenticatedContent={
        <NavbarLoggedInButton onOpenChange={open => open || maybeCloseAfterNavigating()} />
      }
    >
      <Button
        className="w-full text-base font-bold leading-4 md:font-normal min-[1096px]:w-auto"
        variant="primary-cta"
      >
        Sign In
      </Button>
    </LoginDialogWrapper>
  )

  const DonateButton = () => (
    <Button
      asChild
      className="w-full text-base font-bold leading-4 md:font-normal min-[1092px]:w-auto"
      key={urls.donate()}
      onClick={maybeCloseAfterNavigating}
      variant="default"
    >
      <InternalLink href={urls.donate()}>Donate</InternalLink>
    </Button>
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

      <nav
        className={cn(
          'sticky top-0 z-20 flex h-[72px] w-full items-center bg-white py-3 min-[1096px]:h-[84px] min-[1096px]:py-5',
        )}
      >
        <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between px-8">
          <InternalLink className="flex-shrink-0" href={urls.home()}>
            <NextImage
              alt="Stand With Crypto Logo"
              height={40}
              priority
              src="/logo/shield.svg"
              width={41}
            />
          </InternalLink>
          <div className="flex gap-4">
            <div className="flex h-fit gap-4 rounded-full bg-secondary">
              {leftLinks.map(({ href, text, children }, index) => (
                <div
                  className="nav-item group relative"
                  key={text}
                  onMouseEnter={() => {
                    setHoveredMenuIndex(index)
                  }}
                  onMouseLeave={event => {
                    if (
                      event.relatedTarget instanceof Node &&
                      !event.currentTarget.contains(event.relatedTarget as Node)
                    ) {
                      setHoveredMenuIndex(null)
                    }
                  }}
                >
                  <Button asChild className="hidden min-[1096px]:block" variant="secondary">
                    {children ? (
                      <span className="select-none">
                        <div className="flex cursor-default items-center gap-2">
                          {text}
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 shrink-0 transition-transform duration-200',
                              hoveredMenuIndex === index && 'rotate-180 transition-transform',
                            )}
                          />
                        </div>
                      </span>
                    ) : (
                      <InternalLink href={href}>{text}</InternalLink>
                    )}
                  </Button>
                  {children && (
                    <div
                      className={cn(
                        'absolute left-1/2 top-full mt-2 w-[378px] -translate-x-1/2 rounded-[24px] bg-white shadow-[0px_6px_20px_rgba(0,0,0,0.15)]',
                        hoveredMenuIndex === index
                          ? 'flex flex-col justify-between gap-0'
                          : 'hidden',
                        'before:absolute before:-top-2 before:left-0 before:h-[10px] before:w-full before:bg-transparent before:content-[""]',
                      )}
                      onMouseEnter={() => {
                        setHoveredMenuIndex(index)
                      }}
                      onMouseLeave={event => {
                        if (
                          event.relatedTarget instanceof Node &&
                          !event.currentTarget.contains(event.relatedTarget as Node) &&
                          !event.currentTarget.parentElement?.contains(event.relatedTarget as Node)
                        ) {
                          setHoveredMenuIndex(null)
                        }
                      }}
                    >
                      {children.map(
                        ({ href: childHref, text: childText, icon: Icon }, childIndex) => (
                          <Button
                            asChild
                            className={cn(
                              'block w-full rounded-b-none rounded-t-none font-sans text-base font-bold',
                              childIndex === 0 && 'rounded-t-[24px]',
                              childIndex === children.length - 1 && 'rounded-b-[24px]',
                            )}
                            key={childHref}
                            variant="ghost"
                          >
                            <InternalLink
                              className={cn(
                                'flex px-0 py-0',
                                !!Icon &&
                                  'items-center justify-start gap-2 rounded-b-none rounded-t-none p-6',
                                childIndex === 0 && 'rounded-t-[24px]',
                                childIndex === children.length - 1 && 'rounded-b-[24px]',
                              )}
                              href={childHref}
                              onClick={() => setHoveredMenuIndex(null)}
                            >
                              {Icon && <Icon />}
                              {childText}
                            </InternalLink>
                          </Button>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="hidden gap-4 min-[1092px]:flex">
              <DonateButton />
              <LoginButton />
            </div>
          </div>
        </div>
        <Drawer {...dialogProps} direction="top" shouldScaleBackground>
          <DrawerTrigger asChild data-testid="drawer-trigger">
            <button className="p-3 min-[1096px]:hidden">
              <span className="sr-only">Open navigation menu</span>
              <Menu />
            </button>
          </DrawerTrigger>
          <DrawerContent a11yTitle="Navigation Menu" direction="top">
            <div className="h-screen overflow-y-auto pb-6 text-left">
              <div className="flex justify-between p-6">
                <InternalLink className="flex-shrink-0" href={urls.home()}>
                  <NextImage
                    alt="Stand With Crypto Logo"
                    height={40}
                    priority
                    src="/logo/shield.svg"
                    width={41}
                  />
                </InternalLink>
                <DrawerClose asChild>
                  <Button className="px-0" variant="ghost">
                    <Cross1Icon height={16} width={16} />
                  </Button>
                </DrawerClose>
              </div>

              {leftLinks.map(({ href, text, children }) => {
                if (children) {
                  const accordionTitle = text
                  return (
                    <Accordion
                      collapsible
                      key={text}
                      onValueChange={value => setOpenAccordionTitle(value)}
                      type="single"
                      value={openAccordionTitle}
                    >
                      <AccordionItem
                        className={cn(
                          'rounded-none transition-colors',
                          openAccordionTitle === accordionTitle ? 'bg-secondary' : 'bg-transparent',
                        )}
                        value={accordionTitle}
                      >
                        <AccordionTrigger
                          chevronClassName="w-6 h-6"
                          className="rounded-none px-6 pt-6 font-sans text-xl font-bold !no-underline"
                        >
                          {accordionTitle}
                        </AccordionTrigger>
                        <AccordionContent>
                          {children.map(({ href: childHref, text: childText, icon: Icon }) => (
                            <Button
                              asChild
                              className="block w-full font-sans text-xl font-bold"
                              key={childHref}
                              variant="ghost"
                            >
                              <InternalLink
                                className={cn(
                                  'flex p-6 first:pt-3',
                                  !!Icon && 'items-center justify-start gap-3',
                                )}
                                href={childHref}
                                onClick={maybeCloseAfterNavigating}
                              >
                                {Icon && <Icon />}
                                {childText}
                              </InternalLink>
                            </Button>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )
                }

                return (
                  <Button
                    asChild
                    className="block px-6 py-6 font-sans text-xl font-bold"
                    key={href}
                    variant="ghost"
                  >
                    <InternalLink href={href} onClick={maybeCloseAfterNavigating}>
                      {text}
                    </InternalLink>
                  </Button>
                )
              })}
              <div className="mt-4 px-6">
                <LoginButton />
              </div>
              <div className="mt-4 px-6">
                <DonateButton />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </nav>
    </>
  )
}
