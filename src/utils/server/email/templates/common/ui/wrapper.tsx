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
import { US_SOCIAL_MEDIA_URL } from '@/utils/server/email/templates/us/constants'
import { buildTemplateInternalUrl } from '@/utils/server/email/utils/buildTemplateInternalUrl'

interface WrapperProps {
  previewText?: string
  hrefSearchParams?: Record<string, unknown>
}

export function Wrapper({
  previewText,
  hrefSearchParams = {},
  children,
}: React.PropsWithChildren<WrapperProps>) {
  return (
    <Html dir="ltr" lang="en">
      {previewText && <Preview>{previewText}</Preview>}
      <Tailwind config={tailwindConfig}>
        <Head>
          <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        </Head>
        <Body className="mx-auto my-auto bg-background px-10 pb-10 font-sans text-base">
          <Container>
            <HeaderSection hrefSearchParams={hrefSearchParams} />

            {children}

            <FooterSection hrefSearchParams={hrefSearchParams} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

function HeaderSection({ hrefSearchParams }: Pick<WrapperProps, 'hrefSearchParams'>) {
  return (
    <Section className="my-6">
      <Row>
        <Column>
          <Link
            className="inline-block h-10 w-10"
            href={buildTemplateInternalUrl('/', hrefSearchParams)}
          >
            <Img
              alt="Stand With Crypto"
              height="40"
              src={buildTemplateInternalUrl('/email/misc/shield.png', hrefSearchParams)}
              width="40"
            />
          </Link>
        </Column>

        <Column align="right" style={{ display: 'table-cell' }}>
          <Link href={US_SOCIAL_MEDIA_URL.twitter}>
            <Row align="right" className="float-end w-[120px]">
              <Column className="pr-2">
                <Text className="text-end font-semibold text-fontcolor">Follow us on</Text>
              </Column>
              <Column>
                <Img
                  alt="X/Twitter logo"
                  className="inline"
                  height="24"
                  src={buildTemplateInternalUrl('/email/misc/xDotComLogo.png', hrefSearchParams)}
                  width="24"
                />
              </Column>
            </Row>
          </Link>
        </Column>
      </Row>
    </Section>
  )
}

function FooterSection({ hrefSearchParams }: Pick<WrapperProps, 'hrefSearchParams'>) {
  return (
    <>
      <Hr className="mt-10" />

      <Section className="mt-10">
        <Img
          alt="Stand With Crypto"
          height="40"
          src={buildTemplateInternalUrl('/email/misc/shield.png', hrefSearchParams)}
          width="40"
        />

        <Row>
          <Column>
            <Text className="mb-1 text-base">Stand With Crypto</Text>
            <Button
              color="muted"
              href={buildTemplateInternalUrl('/', hrefSearchParams)}
              noPadding
              variant="ghost"
            >
              www.standwithcrypto.org
            </Button>
          </Column>
          <Column align="right">
            <Text className="text-fontcolor-secondary mb-1 text-base">Follow us on socials</Text>
            <Row align="right" className="float-end w-[72px]">
              <Column className="pr-4">
                <Link href={US_SOCIAL_MEDIA_URL.facebook}>
                  <Img
                    alt="Facebook logo"
                    height="24"
                    src={buildTemplateInternalUrl('/email/misc/facebookLogo.png', hrefSearchParams)}
                    width="24"
                  />
                </Link>
              </Column>
              <Column className="pr-4">
                <Link href={US_SOCIAL_MEDIA_URL.twitter}>
                  <Img
                    alt="X/Twitter logo"
                    height="24"
                    src={buildTemplateInternalUrl(
                      '/email/misc/xDotComLogoGrey.png',
                      hrefSearchParams,
                    )}
                    width="24"
                  />
                </Link>
              </Column>
              <Column>
                <Link href={US_SOCIAL_MEDIA_URL.instagram}>
                  <Img
                    alt="Instagram logo"
                    height="24"
                    src={buildTemplateInternalUrl(
                      '/email/misc/instagramLogo.png',
                      hrefSearchParams,
                    )}
                    width="24"
                  />
                </Link>
              </Column>
            </Row>
          </Column>
        </Row>
      </Section>
    </>
  )
}
