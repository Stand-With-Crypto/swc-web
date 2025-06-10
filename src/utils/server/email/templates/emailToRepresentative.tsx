import * as React from 'react'
import { Section, Text } from '@react-email/components'

import { getDefaultEmailBodyText } from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { Wrapper } from '@/utils/server/email/templates/common/ui/wrapper'

interface EmailToRepresentativeProps {
  previewText?: string
  body: string
}

const EmailToRepresentative = ({
  previewText,
  body = getDefaultEmailBodyText({
    firstName: 'John',
    lastName: 'Doe',
  }),
}: EmailToRepresentativeProps) => {
  return (
    <Wrapper previewText={previewText}>
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
