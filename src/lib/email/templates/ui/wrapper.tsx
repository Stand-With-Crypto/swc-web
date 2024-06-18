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

import { BASE_URL, SOCIAL_MEDIA_URL } from '@/lib/email/templates/common/constants'
import { tailwindConfig } from '@/lib/email/templates/common/tailwind-config'
import { Button } from '@/lib/email/templates/ui/button'

interface WrapperProps {
  previewText?: string
}

export function Wrapper({ previewText, children }: React.PropsWithChildren<WrapperProps>) {
  return (
    <Html>
      {previewText && <Preview>{previewText}</Preview>}
      <Tailwind config={tailwindConfig}>
        <Head />
        <Body className="mx-auto my-auto bg-background px-10 pb-10 font-sans text-base">
          <Container>
            <HeaderSection />

            {children}

            <FooterSection />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

function HeaderSection() {
  return (
    <Section className="my-6">
      <Row>
        <Column>
          <Link className="inline-block h-10 w-10" href="https://www.standwithcrypto.org">
            <Img
              alt="Stand With Crypto"
              height="40"
              src={`${BASE_URL}/email/misc/shield.png`}
              width="40"
            />
          </Link>
        </Column>

        <Column align="right" style={{ display: 'table-cell' }}>
          <Link href={SOCIAL_MEDIA_URL.twitter}>
            <Row align="right" className="float-end w-[120px]">
              <Column className="pr-2">
                <Text className="text-end font-semibold text-fontcolor">Follow us on</Text>
              </Column>
              <Column>
                <Img
                  alt="X/Twitter logo"
                  className="inline"
                  height="24"
                  src={`${BASE_URL}/email/misc/xDotComLogo.png`}
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

function FooterSection() {
  return (
    <>
      <Hr className="mt-10" />

      <Section className="mt-10">
        <Img
          alt="Stand With Crypto"
          height="40"
          src={`${BASE_URL}/email/misc/shield.png`}
          width="40"
        />

        <Row>
          <Column>
            <Text className="mb-1 text-base">Stand With Crypto</Text>
            <Button color="muted" href="https://www.standwithcrypto.org" noPadding variant="ghost">
              www.standwithcrypto.org
            </Button>
          </Column>
          <Column align="right">
            <Text className="text-fontcolor-secondary mb-1 text-base">Follow us on socials</Text>
            <Row align="right" className="float-end w-[72px]">
              <Column className="pr-4">
                <Link href={SOCIAL_MEDIA_URL.twitter}>
                  <Img
                    alt="Facebook logo"
                    height="24"
                    src={`${BASE_URL}/email/misc/facebookLogo.png`}
                    width="24"
                  />
                </Link>
              </Column>
              <Column className="pr-4">
                <Link href="https://github.com/LucasRMP">
                  <Img
                    alt="X/Twitter logo"
                    height="24"
                    src={`${BASE_URL}/email/misc/xDotComLogoGrey.png`}
                    width="24"
                  />
                </Link>
              </Column>
              <Column>
                <Link href="https://github.com/LucasRMP">
                  <Img
                    alt="Instagram logo"
                    height="24"
                    src={`${BASE_URL}/email/misc/instagramLogo.png`}
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
