import { Card } from '@/components/ui/card'
import { NextImage } from '@/components/ui/image'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { DEFAULT_PAGE_TITLE_SIZE, PageTitle } from '@/components/ui/pageTitleText'

function P(props: { children: React.ReactNode }) {
  return <p className="text-center text-fontcolor-muted">{props.children}</p>
}

export function PageAbout({ title, description }: { title: string; description: string }) {
  return (
    <div className="standard-spacing-from-navbar container space-y-16">
      <section className="mb-16 space-y-7 md:mb-24">
        <PageTitle>{title}</PageTitle>
        <PageSubTitle>{description}</PageSubTitle>

        <Card.Group>
          {[
            { value: '52M', label: 'Americans own crypto' },
            { value: '87%', label: 'Believe the financial system needs updating' },
            { value: '45%', label: 'Will not back anti-crypto candidates' },
          ].map(({ value, label }) => (
            <Card key={label}>
              <Card.Heading>
                <PageTitle as="p" size={DEFAULT_PAGE_TITLE_SIZE}>
                  {value}
                </PageTitle>
              </Card.Heading>
              <Card.Description>{label}</Card.Description>
            </Card>
          ))}
        </Card.Group>

        <P>
          Nearly nine in ten Americans believe the financial system is overdue for an update. Yet,
          US policymakers seem content on maintaining the status quo, rather than fulfilling their
          responsibilities. This inaction places our nation at risk of losing millions of jobs, and
          driving innovation and global leadership offshore.
        </P>
        <P>
          The Stand With Crypto Alliance, a 501(c)(4) nonprofit, champions for clear, common-sense
          regulations for the crypto industry. We're mobilizing the 52 million crypto owners in the
          US - a demographic that is younger (60% Gen-Z and Millennials) and more diverse (41%
          identify as racial minorities) than the general US population - to unlock crypto's
          innovation potential and foster greater economic freedom.
        </P>
        <P>
          Enough is enough. It's time for our policymakers to step up, embrace the future, and enact
          clear rules for crypto to thrive.
        </P>
      </section>

      <section className="mb-16 space-y-7 md:mb-24">
        <PageTitle as="h2">America needs crypto</PageTitle>

        <P>
          Cryptocurrencies, like Bitcoin and Ethereum, aren't just digital tokens; they are the new
          wave of blockchain technology, paving the way for the internet's third generation: web3.
          It's imperative that America not only contributes to this evolution, but also ensures its
          citizens can harness its potential.
        </P>

        <div className="flex flex-col gap-4">
          <Card className="space-y-4 text-start text-gray-500">
            <PageTitle as="h3" className="text-start text-foreground">
              Crypto creates jobs
            </PageTitle>
            <p>Keeping crypto innovation in America will:</p>
            <ul className="ml-4 mt-4 list-disc">
              <li>
                Secure 4 million jobs over the next 7 years, by preventing the shift of web3
                development overseas.
              </li>
              <li>
                Boost America's share of web3 developers, by attracting and retaining talent to
                reverse the current decline and surpass our previous 40% mark.
              </li>
            </ul>
          </Card>
          <Card className="space-y-4 text-gray-500">
            <PageTitle as="h3" className="text-start text-foreground">
              Crypto drives American innovation
            </PageTitle>
            <p>
              While 130 countries (98% of the global economy) are exploring digital currencies, the
              US is falling behind. Yet, the desire for American leadership is clear:
            </p>
            <ul className="ml-4 mt-4 list-disc">
              <li>53% of Americans want crypto companies to be US-based.</li>
              <li>
                73% of Fortune 500 execs prefer US-based partners for crypto and web3 initiatives.
              </li>
            </ul>
          </Card>
          <Card className="space-y-4 text-gray-500">
            <PageTitle as="h3" className="text-start text-foreground">
              Crypto is a national priority
            </PageTitle>
            <p>
              The US sat idly by with semiconductor manufacturing, and now 92% of advanced
              production is located in Taiwan and South Korea. We can't let history repeat itself,
              and must ensure the US isn't sidelined from the future financial system.
            </p>
          </Card>
        </div>
      </section>

      <section className="mb-16 space-y-7 md:mb-24">
        <PageTitle as="h2">What it means to stand with crypto</PageTitle>

        <P>
          By Standing With Crypto you choose to support common sense legislation and elected
          officials that will:
        </P>

        <ul className="ml-4 mt-2 list-disc text-start text-gray-500">
          <li>Protect the right of Americans to choose to use crypto</li>
          <li>
            Support common-sense legislation that fosters innovation and creates jobs while
            protecting consumers
          </li>
          <li>
            Enable America to remain the leader in financial services for decades to come, rather
            than ceding ground to the 83% of G20 members and major financial hubs have made greater
            progress towards regulatory clarity. We can't afford to get left behind.
          </li>
        </ul>
      </section>

      <section className="mb-16 space-y-7 md:mb-24">
        <PageTitle as="h2">Raise your voice: crypto can't wait</PageTitle>

        <P>
          Lawmakers listen to their constituents, but right now, they're not hearing from the 52
          million crypto community. This silence gives policymakers a free pass to preserve the
          status quo, and in turn stifle American innovation and its global competitiveness. But the
          crypto voter is powerful and bipartisan force:
        </P>

        <Card.Group>
          {[
            {
              value: '18%',
              label: 'Republicans hold crypto',
              image: {
                src: '/parties/republicanFlag.svg',
                alt: 'Republican logo',
              },
            },
            {
              value: '22%',
              label: 'Democrats hold crypto',
              image: {
                src: '/parties/democratFlag.svg',
                alt: 'Democrat logo',
              },
            },
            {
              value: '22%',
              label: 'Independents hold crypto',
            },
          ].map(({ value, label, image }) => (
            <Card key={label}>
              <Card.Heading>
                <PageTitle as="p" size={DEFAULT_PAGE_TITLE_SIZE}>
                  {value}
                </PageTitle>
                {image && (
                  <NextImage
                    // This is necessary because the image is an svg with a "padding",
                    // so we need to offset the padding here
                    alt={image.alt}
                    className="mt-[-5px]"
                    height={50}
                    src={image.src}
                    width={50}
                  />
                )}
              </Card.Heading>
              <Card.Description>{label}</Card.Description>
            </Card>
          ))}
        </Card.Group>

        <P>
          But your voice is crucial. It's not about sending tweets; it's about driving real change.
          Elected officials need to recognize the crypto community's passion, demands, and readiness
          to hold them accountable. We can't just be a "squeaky wheel"; we need to roar with unity,
          ensuring our calls for change are heard and enacted.
        </P>
      </section>
    </div>
  )
}
