// TODO delete before v2 go-live
import { CTAEmailYourCongressperson } from '@/components/app/ctaEmailYourCongressperson/ctaEmailYourCongressperson'
import { Leaderboard } from '@/components/app/leaderboard'
import { NavbarSessionButton } from '@/components/app/navbarSessionButton'
import { SampleAuthenticatedRequest } from '@/components/app/sampleAuthenticatedRequest'
import { getLeaderboard } from '@/data/leaderboard'
import getIntl from '@/intl/intlMessages'
import { generateClientComponentMessages } from '@/intl/intlServerUtils'
import { SUPPORTED_LOCALES } from '@/intl/locales'
import { PageProps } from '@/types'
import { getIntlUrls } from '@/utils/shared/urls'
import Link from 'next/link'
import { SampleTranslationClientComponent } from './sampleTranslationClientComponent'
import { sampleTranslationClientComponentMessages } from './sampleTranslationClientComponent.messages'
import { cn } from '@/utils/web/cn'

export const revalidate = 3600
export const dynamic = 'error'

// TODO metadata

export default async function Home(props: PageProps) {
  const [intl, leaderboardEntities] = await Promise.all([
    getIntl(props.params.lang),
    getLeaderboard({ offset: 0 }),
  ])
  return (
    // TODO remove prose class and actually start styling things!
    <div className="prose-sm mx-auto mb-24 mt-10 w-full max-w-2xl p-4">
      <h1>Sample Architecture Patterns</h1>
      <h2>
        This page contains a sample of architecture patterns that can be used as blueprints for
        implementing standwithcrypto.org.
      </h2>
      <h2>
        <strong>IMPORTANT:</strong> read <code>"docs/Leveraging Modern NextJS Features.md"</code>{' '}
        (including the various blog posts linked in it) for information about what React Server
        Components are and how Next 13+ leverages them with the App Router to help teams rapidly
        build performant, scalable web apps.
      </h2>
      <hr />
      <h3>Sample Leaderboard</h3>
      <p>
        This example shows how we can use server side data to bootstrap a dynamic component that can
        then leverage APIs as needed. A few things to highlight:
      </p>
      <ul className="list-disc">
        <li>
          The server side render will include the first 10 leaderboard, fully generated and cached
          at build time, and then additional items can be appended client side as needed.
        </li>
        <li>
          See <code>src/app/api/leaderboard/[offset]/route</code> for an example of building
          cacheable API routes. Leverage "revalidate" from next.js, that endpoint will server cached
          content until the expiry we set.
        </li>
      </ul>
      <Leaderboard initialEntities={leaderboardEntities} />
      <hr />
      <h3>Sample Auth</h3>
      <p>
        The page this component is loading on is a React Server Component (RSC), but because this
        component has <code>'use client'</code> at the top, it can dynamically render on the client,
        taking in to account the auth session info and web3 injected data.
      </p>
      <p>
        Reload the page and note how the server rendered static html is a loading state, and then it
        bootstraps after the client-side javascript loads.
      </p>
      <div>
        <NavbarSessionButton />
      </div>
      <hr />
      <h3>Sample Authenticated Endpoint</h3>
      <p>
        Pressing the button below will trigger an API request to increment a sample value in the
        database for this user. This endpoint will throw an error if there is no authenticated user.
      </p>
      <SampleAuthenticatedRequest />
      <hr />
      <h3>Sample Intl Messages</h3>
      <p>
        One of the other cool things about RSC is that because all our static content is rendered on
        the server, we can fully internationalize the website without shipping any additional
        client-side javascript to manage i18n. Toggle back and forth between the two locale urls to
        see the language of the page shift for this section:
      </p>
      <p>
        <strong>Translated text in a React Server Component:</strong>{' '}
        {intl.formatMessage({
          id: 'sampleArchitecturePatterns.translatedText',
          defaultMessage: 'This server text is translated!',
          description: 'Sample translated text',
        })}
      </p>
      <p>
        <strong>Translated text in a React Server Component with no spanish translation:</strong>{' '}
        {intl.formatMessage({
          id: `sampleArchitecturePatterns.notTranslated`,
          description: 'A sample intl message with no es translation',
          defaultMessage: 'This server message will always be english!',
        })}
      </p>
      <SampleTranslationClientComponent
        messages={generateClientComponentMessages(intl, sampleTranslationClientComponentMessages)}
      />
      <div>
        <p>Locale Links</p>
        <div className="space-x-4">
          {SUPPORTED_LOCALES.map(locale => (
            <Link
              className={cn(locale === props.params.lang && 'text-blue-500')}
              href={getIntlUrls(locale).sampleArchitecturePatterns()}
              key={locale}
            >
              {locale}
            </Link>
          ))}
        </div>
      </div>
      <hr />
      <h2>Sample complex form</h2>
      <p>
        Clicking the CTA will open a modal that showcases the <code>react-hook-form</code> library,
        along with the power of submitting mutations via{' '}
        <a href="https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations">
          Next.js Server Actions
        </a>{' '}
        (see how we import the server side code from{' '}
        <code>src/actions/triggerEmailYourCongressPerson.ts</code> directly into the client side
        component)
      </p>
      <CTAEmailYourCongressperson />
    </div>
  )
}
