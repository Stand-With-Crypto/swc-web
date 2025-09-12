import * as React from 'react'
import { Section, Text } from '@react-email/components'

import { Wrapper } from '@/utils/server/email/templates/common/ui/wrapper'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface EmailToRepresentativeProps {
  previewText?: string
  body: string
  countryCode: SupportedCountryCodes
}

const EmailToRepresentative = ({ previewText, body, countryCode }: EmailToRepresentativeProps) => {
  return (
    <Wrapper countryCode={countryCode} previewText={previewText}>
      <Section>
        <Text>
          {body.split('\n').map((paragraph, i) => (
            <React.Fragment key={i}>
              {paragraph}
              <br />
            </React.Fragment>
          ))}
        </Text>
      </Section>
    </Wrapper>
  )
}

export default EmailToRepresentative
