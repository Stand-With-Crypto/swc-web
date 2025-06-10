import * as React from 'react'
import { Section, Text } from '@react-email/components'

import { USWrapper } from '@/utils/server/email/templates/us/wrapper'

interface EmailToRepresentativeProps {
  previewText?: string
  body: string
}

const EmailToRepresentative = ({ previewText, body }: EmailToRepresentativeProps) => {
  return (
    <USWrapper previewText={previewText}>
      <Section>
        <Text>{body}</Text>
      </Section>
    </USWrapper>
  )
}

export default EmailToRepresentative
