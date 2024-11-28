import { ToolkitSection } from '@/components/app/pageAdvocacyToolkit/toolkitSection'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

interface PageAdvocacyToolkitProps {
  title: string
  description: string
}

const DOWNLOAD_LINKS = {
  EVENT_GUIDE:
    'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/public/Stand%20With%20Crypto_%20Crypto%20Events%20&%20Watch%20Party%20Guide%20(1)-y76BOobXMsLAu29UiIZdEv18dvR5Ki.pdf',
  STATE_CHAPTER_GUIDE:
    'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/public/Stand%20with%20Crypto_%20Local%20Chapters%20Guide%20-%20Fall%202024%20(1)-QRUwgpKB8IifHadf2BIBkpPKdvQY2u.pdf',
}

const IMPACT_ITEMS = [
  {
    accordionTitle: 'Protecting innovation in America',
    accordionContent: (
      <p>
        Keeping innovation in America is vital for our country's economic growth and global
        competitiveness. The emerging crypto industry presents a tremendous opportunity to drive
        innovation, create jobs, and foster economic development.
      </p>
    ),
  },
  {
    accordionTitle: 'Updating the financial system',
    accordionContent: (
      <p>
        By voting for pro-crypto candidates, you have the power to shape policies that will
        modernize and revolutionize the financial system. Your vote can pave the way for a more
        inclusive, secure, and innovative crypto ecosystem.
      </p>
    ),
  },
  {
    accordionTitle: 'Bipartisan support',
    accordionContent: (
      <p>
        The crypto voter demographic is diverse and bipartisan. Your vote transcends party lines and
        sends a strong message to politicians that crypto is a bipartisan issue that cannot be
        ignored.
      </p>
    ),
  },
  {
    accordionTitle: 'Amplifying awareness',
    accordionContent: (
      <p>
        Your vote helps generate media coverage and raise awareness about the importance of
        crypto-related issues. By voting and actively participating in the electoral process, you
        contribute to the visibility and recognition of the crypto voter.
      </p>
    ),
  },
  {
    accordionTitle: 'Protecting consumer interests',
    accordionContent: (
      <p>
        Voting for candidates who support clear regulatory frameworks for digital assets ensures the
        protection of consumer interests. Your vote can help establish balanced regulations that
        foster innovation while safeguarding consumers.
      </p>
    ),
  },
]

export function PageAdvocacyToolkit({ title, description }: PageAdvocacyToolkitProps) {
  return (
    <div className="standard-spacing-from-navbar container">
      <section className="space-y-14">
        <div className="container flex flex-col items-center gap-4">
          <PageTitle className="mb-7">{title}</PageTitle>
          <PageSubTitle className="text-muted-foreground" size="md">
            {description}
          </PageSubTitle>
        </div>
      </section>

      <ToolkitSection
        heading="Host a Stand With Crypto event"
        headingClassName="text-xl"
        sectionClassName="mt-20"
        subtext="Stand With Crypto is encouraging advocates to organize events all across the country and we need your help to make them happen. SwC is providing guidance and funding to advocates in various cities to bring their communities together! The goal is to demonstrate that the crypto voter is real, present in important states, and engaged with the political process."
      >
        <Button
          asChild
          className="w-full text-xl font-semibold leading-6 sm:w-auto"
          variant="primary-cta"
        >
          <ExternalLink href={DOWNLOAD_LINKS.EVENT_GUIDE}>Download event guide</ExternalLink>
        </Button>
      </ToolkitSection>

      <ToolkitSection
        heading="Launch a local chapter"
        headingClassName="text-xl"
        sectionClassName="mt-20"
        subtext="The crypto voter can have a significant influence in the 2024 election and beyond. A key to building out the most impactful network of crypto users in the USA is establishing strong state chapters nationwide. These chapters will be a force multiplier to the power that our community can wield in our pursuit of securing pro-crypto policies and candidates."
      >
        <Button
          asChild
          className="w-full text-xl font-semibold leading-6 sm:w-auto"
          variant="primary-cta"
        >
          <ExternalLink href={DOWNLOAD_LINKS.STATE_CHAPTER_GUIDE}>
            Download the chapter guide
          </ExternalLink>
        </Button>
      </ToolkitSection>

      <ToolkitSection
        childrenWrapperClassName="mt-10"
        heading="Why does your voice matter? Does it make an impact?"
        headingClassName="text-xl"
        sectionClassName="mt-20"
        subtext="The crypto voter can make a real difference in the 2024 election and beyond. A key to building on the most impactful network of crypto users in the USA is establishing strong state chapters nationwide. These chapters will be a force multiplier to the power that our community can wield in our pursuit of securing pro-crypto policies and candidates."
      >
        <Accordion className="w-full" collapsible type="single">
          {IMPACT_ITEMS.map(({ accordionTitle, accordionContent }) => (
            <AccordionItem key={accordionTitle} value={accordionTitle}>
              <AccordionTrigger>
                <strong className="text-foreground">{accordionTitle}</strong>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm max-w-none px-4 pb-6 text-muted-foreground">
                  {accordionContent}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ToolkitSection>
    </div>
  )
}
