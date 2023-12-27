import { NavbarSessionButton } from '@/components/app/navbarSessionButton'
import { navbarSessionButtonMessages } from '@/components/app/navbarSessionButton/navbarSessionButtonClient.messages'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import getIntl from '@/intl/intlMessages'
import { generateClientComponentMessages } from '@/intl/intlServerUtils'
import { SupportedLocale } from '@/intl/locales'
import { PageProps } from '@/types'
import { getIntlUrls } from '@/utils/shared/urls'

const INTL_PREFIX = 'Navbar'

export async function Navbar({ locale }: { locale: SupportedLocale }) {
  const intl = await getIntl(locale)
  const urls = getIntlUrls(locale)
  return (
    <>
      {/* TODO Delete */}
      <div className="bg-yellow-300 p-3 text-center text-xs md:text-base">
        <InternalLink className="w-full underline" href={urls.sampleArchitecturePatterns()}>
          Click To View SWC v2 Sample Architecture Patterns
        </InternalLink>
      </div>
      {/* TODO mobile once they have mockups */}
      <nav className="container flex justify-between py-8">
        <div className="flex items-center gap-8">
          <InternalLink href={urls.home()}>
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
          {[
            {
              href: urls.about(),
              text: intl.formatMessage({
                id: `${INTL_PREFIX}.about`,
                defaultMessage: 'About (TODO)',
                description: 'Link to the about page',
              }),
            },
            {
              href: urls.leaderboard(),
              text: intl.formatMessage({
                id: `${INTL_PREFIX}.leaderboard`,
                defaultMessage: 'Leaderboard (TODO)',
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
              href: urls.home(),
              text: intl.formatMessage({
                id: `${INTL_PREFIX}.resources`,
                defaultMessage: 'Resources (TODO)',
                description: 'Link to the resources page',
              }),
            },
          ].map(({ href, text }) => {
            return (
              <InternalLink className="hidden text-gray-800 md:block" href={href} key={href}>
                {text}
              </InternalLink>
            )
          })}
        </div>
        <div className="flex">
          {/* TODO actually implement donate button */}
          <Button className="mr-3">Donate (TODO)</Button>
          <NavbarSessionButton
            messages={generateClientComponentMessages(intl, navbarSessionButtonMessages)}
          />
        </div>
      </nav>
    </>
  )
}
