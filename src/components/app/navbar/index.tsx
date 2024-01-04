import { NavbarSessionButton } from '@/components/app/navbar/navbarSessionButton'
import { navbarSessionButtonMessages } from '@/components/app/navbar/navbarSessionButton/navbarSessionButtonClient.messages'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import getIntl from '@/intl/intlMessages'
import { generateClientComponentMessages } from '@/intl/intlServerUtils'
import { SupportedLocale } from '@/intl/locales'
import { PageProps } from '@/types'
import { getIntlUrls } from '@/utils/shared/urls'
import { Menu } from 'lucide-react'

const INTL_PREFIX = 'Navbar'

export async function Navbar({ locale }: { locale: SupportedLocale }) {
  const intl = await getIntl(locale)
  const urls = getIntlUrls(locale)
  const leftLinks = [
    {
      href: urls.home(),
      text: intl.formatMessage({
        id: `${INTL_PREFIX}.home`,
        defaultMessage: 'Home',
        description: 'Link to the home page',
      }),
    },
    {
      href: urls.about(),
      text: intl.formatMessage({
        id: `${INTL_PREFIX}.about`,
        defaultMessage: 'Mission',
        description: 'Link to the about page',
      }),
    },
    {
      href: urls.leaderboard(),
      text: intl.formatMessage({
        id: `${INTL_PREFIX}.leaderboard`,
        defaultMessage: 'Our Community',
        description: 'Link to the leaderboard page',
      }),
    },
    {
      href: urls.politiciansHomepage(),
      text: intl.formatMessage({
        id: `${INTL_PREFIX}.politicians`,
        defaultMessage: 'Politicians',
        description: 'Link to the politicians page',
      }),
    },
    {
      href: urls.resources(),
      text: intl.formatMessage({
        id: `${INTL_PREFIX}.resources`,
        defaultMessage: 'Resources',
        description: 'Link to the resources page',
      }),
    },
  ]
  return (
    <>
      {/* TODO Delete */}
      <div className="bg-yellow-300 p-3 text-center text-xs md:text-base">
        <InternalLink className="w-full underline" href={urls.sampleArchitecturePatterns()}>
          Click To View SWC v2 Sample Architecture Patterns
        </InternalLink>
      </div>
      {/* TODO mobile once they have mockups */}
      <nav className="container flex justify-between py-3 md:py-8">
        <div className="flex items-center gap-8">
          <InternalLink className="flex-shrink-0" href={urls.home()}>
            <NextImage
              priority
              width={41}
              height={40}
              src="/logo/shield.svg"
              alt={intl.formatMessage({
                id: `${INTL_PREFIX}.logoAlt`,
                defaultMessage: 'Stand With Crypto Logo',
                description: 'Alt text for the main Stand With Crypto Logo',
              })}
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
        {/* padding improves the touch target */}
        {/* TODO swap this to drop down from the top once https://github.com/emilkowalski/vaul/pull/187 lands */}
        <Drawer>
          <DrawerTrigger asChild>
            <button className="py-3 pl-3 md:hidden">
              <span className="sr-only">Open navigation menu</span>
              <Menu />
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="space-y-6 px-6 pb-6 pt-3 text-center md:space-y-8">
              <p className="text-xs">
                Eng note: I know this is suppose to open from the top. There's an open PR for the
                lib we're using that should enable this
              </p>
              {leftLinks.map(({ href, text }) => {
                return (
                  <InternalLink className="block font-bold text-gray-800" href={href} key={href}>
                    {text}
                  </InternalLink>
                )
              })}
              <Button className="mr-3" asChild>
                <InternalLink href={urls.donate()}>Donate</InternalLink>
              </Button>
              <NavbarSessionButton
                messages={generateClientComponentMessages(intl, navbarSessionButtonMessages)}
              />
            </div>
          </DrawerContent>
        </Drawer>

        <div className="hidden md:flex">
          {/* TODO actually implement donate button */}
          <Button className="mr-3" asChild>
            <InternalLink href={urls.donate()}>Donate</InternalLink>
          </Button>
          <NavbarSessionButton
            messages={generateClientComponentMessages(intl, navbarSessionButtonMessages)}
          />
        </div>
      </nav>
    </>
  )
}
