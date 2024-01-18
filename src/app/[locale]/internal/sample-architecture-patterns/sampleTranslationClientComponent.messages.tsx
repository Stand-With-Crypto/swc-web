import { defineMessages } from '@/intl/intlServerUtils'

export const sampleTranslationClientComponentMessages = defineMessages({
  translatedText: {
    id: `sampleArchitecturePatterns.sampleTranslationClientComponent.translatedText`,
    defaultMessage: 'This client text is translated!',
    description: 'Sample translated text',
  },
  notTranslated: {
    id: `sampleArchitecturePatterns.sampleTranslationClientComponent.notTranslated`,
    description: 'A sample intl message with no es translation',
    defaultMessage: 'This client message will always be english!',
  },
})
