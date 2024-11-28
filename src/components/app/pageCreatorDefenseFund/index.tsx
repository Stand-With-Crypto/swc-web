import { DefenseFundSection } from '@/components/app/pageCreatorDefenseFund/defenseFundSection'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

interface PageCreatorDefenseFundProps {
  title: string
  description: string
}

const A16LOGO = '/creatorDefenseFund/a16zcrypto-logo-singleline-graydark.svg'
const OPENSEA_LOGO = '/partners/opensea-full-logo-dark.svg'

const SECTION_ICONS = {
  APPLY_FOR_REPRESENTATION: '/activityFeedIcons/email.svg',
  GET_INVOLVED: '/activityFeedIcons/join.svg',
}

const SWC_EMAIL_LINK = 'mailto:info@standwithcrypto.org'
const EMAIL_THE_SEC_LINK = 'mailto:chair@sec.gov'
const SEC_GOV_LINK = 'https://www.sec.gov/newsroom/press-releases/2023-178'

const FORM_LINKS = {
  LEGAL_SUPPORT_APPLICATION_FORM: 'https://forms.gle/rg1Ke1FKzTuroRMt6',
  APPLY_FOR_REPRESENTATION_FORM: 'https://forms.gle/rg1Ke1FKzTuroRMt6',
}

const FAQ_ITEMS = [
  {
    accordionTitle: 'What is the Creator Legal Defense Fund?',
    accordionContent: (
      <p>
        The Creator Defense Fund is a collaboration led by Stand With Crypto Alliance, Inc. (SWCA)
        that is aimed at providing legal support to artists and creators facing threats from
        government actions or trying to navigate regulatory uncertainty, particularly related to the
        crypto space.
      </p>
    ),
  },
  {
    accordionTitle: 'Who is eligible for support?',
    accordionContent: (
      <p>
        Artists, creators, and builders who have been contacted by the SEC or who are concerned
        about potential litigation due to their use of blockchain technology can apply for
        representation.
      </p>
    ),
  },
  {
    accordionTitle: 'How do I apply for legal support?',
    accordionContent: (
      <p>
        You can apply for legal support by filling out the{' '}
        <ExternalLink href={FORM_LINKS.LEGAL_SUPPORT_APPLICATION_FORM}>
          application form
        </ExternalLink>
        . Please note that submitting an application does not guarantee legal support, as all
        requests will be reviewed by, and all decisions on who is eligible for support will be made
        at the sole discretion of, the Creator Legal Defense Fund.
      </p>
    ),
  },
  {
    accordionTitle: 'What happens after I apply?',
    accordionContent: (
      <p>
        Once you submit your application, your information will be reviewed by the Creator Legal
        Defense Fund and its partnering law firms. If your case is selected for representation, you
        will be contacted with next steps. Please note that we may not be able to provide support to
        every applicant.
      </p>
    ),
  },
  {
    accordionTitle: 'Does submitting an application guarantee that I will receive legal support?',
    accordionContent: (
      <p>
        No, applying for support does not guarantee legal support. Legal support is provided at the
        sole discretion of the Creator Legal Defense Fund. We reserve the right to refuse support
        based on the review of each case.
      </p>
    ),
  },
  {
    accordionTitle: 'What kinds of legal challenges does the fund cover?',
    accordionContent: (
      <p>
        The Creator Legal Defense Fund primarily focuses on providing support for legal challenges
        related to blockchain technology, such as those stemming from government regulations,
        enforcement actions (SEC Wells notices etc.), and other threats to creators and innovators
        in the crypto space.
      </p>
    ),
  },
  {
    accordionTitle: 'Can I submit an application if I am located outside of the United States?',
    accordionContent: (
      <p>
        No. The fund currently focuses on providing support to artists and creators facing legal
        challenges within the U.S.
      </p>
    ),
  },
  {
    accordionTitle: 'Can I withdraw my application?',
    accordionContent: (
      <p>
        Yes, if you wish to withdraw your application after submission, please contact us at{' '}
        <ExternalLink href={SWC_EMAIL_LINK}>info@standwithcrypto.org</ExternalLink>
      </p>
    ),
  },
  {
    accordionTitle: 'Is there any cost associated with applying for or receiving legal support?',
    accordionContent: (
      <p>
        No, the legal consultations and services offered through the Creator Defense Fund are free
        of charge to eligible artists and creators. However, the type, amount, and/or length of
        legal support that the Creator Defense Fund will provide may be limited and will be set
        forth in more detail in our response if your application is approved.
      </p>
    ),
  },
  {
    accordionTitle: 'How long does it take to receive a response?',
    accordionContent: (
      <p>
        The review process may take several weeks, depending on the complexity of a case and the
        volume of applications. If your application is selected, you will be contacted directly with
        further information. Importantly, if you have received a notice from the government or a
        legal complaint that requires a response, you should make sure to meet any deadlines and
        requirements; submitting an application to the Creator Legal Defense Fund does not have any
        impact on those deadlines and requirements.
      </p>
    ),
  },
  {
    accordionTitle: 'If I am selected, who will be my lawyer?',
    accordionContent: (
      <p>
        If your application is approved, the Creator Legal Defense Fund will connect you with an
        attorney who will represent you and who will provide legal services to you. Nothing on this
        website should be considered legal advice, and submitting an application to the Creator
        Defense Fund does not create an attorney-client relationship.
      </p>
    ),
  },
  {
    accordionTitle: 'Will I get a response if I apply?',
    accordionContent: (
      <p>
        You may receive a response if we need more information or to set up a call for further
        consideration. However, if your application is not selected, you might not receive a
        response. We appreciate your understanding due to the high volume of applications.
      </p>
    ),
  },
]

export function PageCreatorDefenseFund({ title, description }: PageCreatorDefenseFundProps) {
  return (
    <div className="standard-spacing-from-navbar container">
      <section className="container">
        <PageTitle className="mb-7">{title}</PageTitle>
        <PageSubTitle className="text-muted-foreground" size="md">
          {description}
        </PageSubTitle>
      </section>

      <DefenseFundSection
        heading="Apply for representation"
        headingClassName="text-xl"
        iconSrc={SECTION_ICONS.APPLY_FOR_REPRESENTATION}
        sectionClassName="mt-20"
        subtext={
          <span>
            With the SEC issuing OpenSea a Wells notice, as well as{' '}
            <ExternalLink href={SEC_GOV_LINK}>other attacks</ExternalLink> on artists and creators,
            it has become clear that those looking to build on blockchain technology will continue
            to face significant legal threats and challenges. If you're an artist or creator facing
            legal challenges or simply need help navigating the unclear regulatory environment,
            we're here to help. The Creator Legal Defense Fund, supported by a16z crypto, OpenSea,
            Cooley LLP, Fenwick & West LLP, Goodwin Procter LLP, and Latham & Watkins LLP, is
            dedicated to offering free legal consultations and services to help artists and creators
            navigate these challenges.
          </span>
        }
      >
        <Button asChild variant="secondary">
          <ExternalLink
            className="text-foreground no-underline hover:no-underline"
            href={FORM_LINKS.APPLY_FOR_REPRESENTATION_FORM}
          >
            Get in touch
          </ExternalLink>
        </Button>
      </DefenseFundSection>

      <DefenseFundSection
        heading="Get involved"
        headingClassName="text-xl"
        iconSrc={SECTION_ICONS.GET_INVOLVED}
        sectionClassName="mt-20"
        subtext={
          <span>
            This partnership is about defending artists and creators who seek to harness the power
            of blockchain technology while galvanizing the crypto community to advocate for our
            collective rights. You can make a difference by directly pressing the SEC to reconsider
            its approach in a misguided regulatory environment. Email the SEC to express your
            concerns and advocate for policies that protect creative freedom and support innovation.
            Let your voice be heard, and join us in educating the crypto community about politicians
            who support common-sense blockchain policies.
          </span>
        }
      >
        <Button asChild variant="secondary">
          <ExternalLink
            className="text-foreground no-underline hover:no-underline"
            href={EMAIL_THE_SEC_LINK}
          >
            Email the SEC
          </ExternalLink>
        </Button>
      </DefenseFundSection>

      <DefenseFundSection
        childrenWrapperClassName="mt-10"
        heading="Frequently asked questions"
        headingClassName="text-xl"
        sectionClassName="mt-20"
      >
        <Accordion className="w-full" collapsible type="single">
          {FAQ_ITEMS.map(({ accordionTitle, accordionContent }) => (
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
      </DefenseFundSection>

      <section className="mt-20">
        <div className="container flex flex-col items-center gap-4">
          <PageSubTitle className="font-medium text-foreground" size="md">
            Supported by
          </PageSubTitle>
          <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:gap-12">
            <NextImage
              alt="a16z crypto logo"
              height="200"
              src={A16LOGO}
              style={{ width: 256, height: 'auto' }}
              width={256}
            />
            <NextImage
              alt="opensea logo"
              height="200"
              src={OPENSEA_LOGO}
              style={{ width: 256, height: 'auto' }}
              width={256}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
