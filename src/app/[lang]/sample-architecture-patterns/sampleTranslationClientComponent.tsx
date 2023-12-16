'use client'

import { sampleTranslationClientComponentMessages } from './sampleTranslationClientComponent.messages'
import { GetDefineMessageResults } from '@/types'

export function SampleTranslationClientComponent({
  messages,
}: {
  messages: GetDefineMessageResults<typeof sampleTranslationClientComponentMessages>
}) {
  return (
    <>
      <p>
        <strong>Translated text in a React Client Component:</strong> {messages.translatedText}
      </p>
      <p>
        <strong>Translated text in a React Client Component with no spanish translation:</strong>{' '}
        {messages.notTranslated}
      </p>
    </>
  )
}
