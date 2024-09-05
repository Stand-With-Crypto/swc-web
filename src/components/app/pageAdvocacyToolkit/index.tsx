import { ToolkitSection } from '@/components/app/pageAdvocacyToolkit/toolkitSection'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedLocale } from '@/intl/locales'
import { getIntlUrls } from '@/utils/shared/urls'

interface PagePartnersProps {
  title: string
  description: string
  locale: SupportedLocale
}

export function PageAdvocacyToolkit({ title, description, locale }: PagePartnersProps) {
  return (
    <div className="standard-spacing-from-navbar container">
      <section className="space-y-14">
        <div className="container flex flex-col items-center gap-4">
          <NextImage
            alt="Toolkit Shield"
            height={150}
            src="/advocacy-toolkit/toolkit-shield.png"
            width={150}
          />

          <PageTitle className="font-sans !text-[32px]">{title}</PageTitle>
          <PageSubTitle size="lg">{description}</PageSubTitle>
        </div>

        <div className="container flex flex-col items-center gap-4">
          <PageSubTitle className="font-bold text-foreground" size="lg">
            Why does your voice matter? Does it make an impact?
          </PageSubTitle>
          <p className="text-center font-mono text-base text-muted-foreground">
            The crypto voter can make a real difference in the 2024 election and beyond. A key to
            building on the most impactful network of crypto users in the USA is establishing strong
            state chapters nationwide. These chapters will be a force multiplier to the power that
            our community can wield in our pursuit of securing pro-crypto policies and candidates.
          </p>
        </div>

        <div className="container flex flex-col items-center gap-4">
          <ul className="ml-4 mt-4 list-disc">
            <li className="text-muted-foreground">
              <strong className="text-foreground">Protecting Innovation in America:</strong> Keeping
              innovation in America is vital for our country's economic growth and global
              competitiveness. The emerging crypto industry presents a tremendous opportunity to
              drive innovation, create jobs, and foster economic development.
            </li>
            <li className="text-muted-foreground">
              <strong className="text-foreground">Updating the Financial System:</strong> By voting
              for pro-crypto candidates, you have the power to shape policies that will modernize
              and revolutionize the financial system. Your vote can pave the way for a more
              inclusive, secure, and innovative crypto ecosystem.
            </li>
            <li className="text-muted-foreground">
              <strong className="text-foreground">Bipartisan Support:</strong> The crypto voter
              demographic is diverse and bipartisan. Your vote transcends party lines and sends a
              strong message to politicians that crypto is a bipartisan issue that cannot be
              ignored.
            </li>
            <li className="text-muted-foreground">
              <strong className="text-foreground">Amplifying Awareness:</strong> Your vote helps
              generate media coverage and raise awareness about the importance of crypto-related
              issues. By voting and actively participating in the electoral process, you contribute
              to the visibility and recognition of the crypto voter.
            </li>
            <li className="text-muted-foreground">
              <strong className="text-foreground">Protecting Consumer Interests:</strong> Voting for
              candidates who support clear regulatory frameworks for digital assets ensures the
              protection of consumer interests. Your vote can help establish balanced regulations
              that foster innovation while safeguarding consumers.
            </li>
          </ul>
        </div>
      </section>

      <ToolkitSection
        heading="The advocacy toolkit"
        headingClassName="font-bold"
        sectionClassName="mt-14"
        subtext="These materials include helpful toolkits and tactics guides for a wide range of
            organizing activities, and training materials on organizing fundamentals. It includes
            the guides for hosting an advocacy event, a voter registration event, digital advocacy
            tactics, and more."
      />

      <ToolkitSection
        heading="Host an event"
        headingClassName="text-primary-cta"
        subtext="Hosting a voter registration drive is crucial - it empowers individuals to exercise
              their democratic right to vote. By organizing such drives, advocates can increase
              voter participation, and ensure that the crypto voter is heard this election season.
              Voter registration drives have a significant impact on shaping the political
              landscape."
      >
        <Button asChild className="w-full sm:w-auto">
          <InternalLink href={getIntlUrls(locale).contribute()}>Download event guide</InternalLink>
        </Button>
      </ToolkitSection>

      <ToolkitSection
        heading="Host a voter registration drive"
        headingClassName="text-primary-cta"
        subtext="Hosting a voter registration drive is crucial - it empowers individuals to exercise their democratic right to vote. By organizing such drives, advocates can increase voter participation, and ensure that the crypto voter is heard this election season. Voter registration drives have a significant impact on shaping the political landscape."
      >
        <Button asChild className="w-full sm:w-auto">
          <InternalLink href={getIntlUrls(locale).contribute()}>
            Download voter registration guide
          </InternalLink>
        </Button>
      </ToolkitSection>

      <ToolkitSection
        heading="Launch a state chapter"
        headingClassName="text-primary-cta"
        subtext="The crypto voter can have a significant influence in the 2024 election and beyond. A key to building out the most impactful network of crypto users in the USA is establishing strong state chapters nationwide. These chapters will be a force multiplier to the power that our community can wield in our pursuit of securing pro-crypto policies and candidates."
      >
        <Button asChild className="w-full sm:w-auto">
          <InternalLink href={getIntlUrls(locale).contribute()}>
            Download voter registration guide
          </InternalLink>
        </Button>
      </ToolkitSection>
    </div>
  )
}
