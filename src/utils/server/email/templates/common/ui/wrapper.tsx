import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

import { tailwindConfig } from '@/utils/server/email/templates/common/tailwind-config'
import { Button } from '@/utils/server/email/templates/common/ui/button'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export interface WrapperProps {
  previewText?: string
  hrefSearchParams?: Record<string, unknown>
  countryCode: SupportedCountryCodes
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      sentBy: 'This email was sent by {sendingEntity}',
      privacyPolicy: 'Privacy Policy',
      followOnSocials: 'Follow us on socials',
    },
    fr: {
      sentBy: 'Cet e-mail a été envoyé par {sendingEntity}',
      privacyPolicy: 'Politique de confidentialité',
      followOnSocials: 'Suivez-nous sur les réseaux sociaux',
    },
    de: {
      sentBy: 'Diese E-Mail wurde gesendet von {sendingEntity}',
      privacyPolicy: 'Datenschutzrichtlinie',
      followOnSocials: 'Folgen Sie uns auf Social Media',
    },
  },
})

export function Wrapper({ previewText, children }: React.PropsWithChildren<WrapperProps>) {
  return (
    <Html dir="ltr" lang="en">
      {previewText && <Preview>{previewText}</Preview>}
      <Tailwind config={tailwindConfig}>
        <Head>
          <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        </Head>
        <Body className="mx-auto my-auto bg-background px-10 pb-10 font-sans text-base">
          <Container>{children}</Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export function HeaderSection({
  children,
}: Pick<React.PropsWithChildren<WrapperProps>, 'children'>) {
  return (
    <Section className="my-6">
      <Row>{children}</Row>
    </Section>
  )
}
HeaderSection.Logo = function HeaderSectionLogo({
  children,
  href,
}: {
  children: React.ReactNode
  href: string
}) {
  return (
    <Link className="inline-block h-10 w-10" href={href}>
      {children}
    </Link>
  )
}
HeaderSection.SocialMedia = function HeaderSectionSocialMedia({
  children,
  href,
  text = 'Follow us on',
}: {
  children: React.ReactNode
  href: string
  text: string
}) {
  return (
    <Link href={href}>
      <Row align="right" className="float-end w-[120px]">
        <Column className="pr-2">
          <Text className="text-end font-semibold text-fontcolor">{text}</Text>
        </Column>
        <Column>{children}</Column>
      </Row>
    </Link>
  )
}

export function FooterSection({
  children,
  shieldSrc,
  swcHref,
  sendingEntity,
  physicalMailingAddress,
  privacyPolicyHref,
  countryCode,
  language = SupportedLanguages.EN,
}: {
  children: React.ReactNode
  shieldSrc: string
  swcHref: string
  sendingEntity: string
  countryCode: SupportedCountryCodes
  physicalMailingAddress: string | undefined
  privacyPolicyHref: string
  language?: SupportedLanguages
}) {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

  return (
    <>
      <Hr className="mt-10" />
      <Section className="mt-10">
        <Img alt="Stand With Crypto shield" height="40" src={shieldSrc} width="40" />

        {/* Desktop */}
        <Row className="hidden md:table">
          <Column>
            <Text className="text-base">{t('sentBy', { sendingEntity })}</Text>
            {physicalMailingAddress && (
              <Text className="text-fontcolor-secondary !-mt-2 text-xs">
                {physicalMailingAddress}
              </Text>
            )}

            <Button color="muted" href={swcHref} noPadding variant="ghost">
              www.standwithcrypto.org
            </Button>
            <span className="text-base text-muted-foreground">{' | '}</span>
            <Button color="muted" href={privacyPolicyHref} noPadding variant="ghost">
              {t('privacyPolicy')}
            </Button>
          </Column>

          <Column align="right">
            <Text className="text-fontcolor-secondary text-base">{t('followOnSocials')}</Text>
            <Row align="right" className="float-end w-[72px]">
              {children}
            </Row>
          </Column>
        </Row>

        {/* Mobile */}
        <Section className="table md:hidden">
          <Text className="text-base">{t('sentBy', { sendingEntity })}</Text>
          {physicalMailingAddress && (
            <Text className="text-fontcolor-secondary !-mt-2 text-xs">
              {physicalMailingAddress}
            </Text>
          )}

          <Row>
            <Button color="muted" href={swcHref} noPadding variant="ghost">
              www.standwithcrypto.org
            </Button>
          </Row>
          <Row>
            <Button color="muted" href={privacyPolicyHref} noPadding variant="ghost">
              {t('privacyPolicy')}
            </Button>
          </Row>

          <Text className="text-fontcolor-secondary mt-4 text-center text-base">
            {t('followOnSocials')}
          </Text>
          <Row align="center" className="mx-auto w-[72px]">
            {children}
          </Row>
        </Section>
      </Section>
    </>
  )
}

FooterSection.SocialMedia = function FooterSectionSocialMedia({
  href,
  alt,
  src,
}: {
  href: string
  alt: string
  src: string
}) {
  return (
    <Column className="pl-4">
      <Link href={href}>
        <Img alt={alt} height="24" src={src} width="24" />
      </Link>
    </Column>
  )
}
