import * as React from 'react'
import { Section, Text } from '@react-email/components'

import { Wrapper } from '@/utils/server/email/templates/common/ui/wrapper'

interface EmailToRepresentativeProps {
  previewText?: string
  body: string
}

const EmailToRepresentative = ({ previewText, body }: EmailToRepresentativeProps) => {
  return (
    <Wrapper previewText={previewText}>
      <Section>
        <Text>{body}</Text>
      </Section>
    </Wrapper>
  )
}

export default EmailToRepresentative
