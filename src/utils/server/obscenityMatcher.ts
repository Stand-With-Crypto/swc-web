// I have concerns about the bundle size of this being imported to the client
import 'server-only'

import * as Sentry from '@sentry/nextjs'
import {
  englishDataset,
  englishRecommendedTransformers,
  RegExpMatcher,
  TextCensor,
} from 'obscenity'

const dataset = englishDataset
  .addPhrase(phrase => phrase.setMetadata({ originalWord: 'fuck' }).addWhitelistedTerm('fickes'))
  .addPhrase(phrase =>
    phrase
      .setMetadata({ originalWord: 'dick' })
      .addWhitelistedTerm('murdock')
      .addWhitelistedTerm('dickerson')
      .addWhitelistedTerm('haydock')
      .addWhitelistedTerm('dock'),
  )

const obscenityMatcher = new RegExpMatcher({
  ...dataset.build(),
  ...englishRecommendedTransformers,
})

export const hasBadWord = (input: string) => {
  const matches = obscenityMatcher.hasMatch(input)
  if (matches) {
    Sentry.captureMessage(`Detected obscenity: ${input}`, { extra: { input } })
  }
  return matches
}

export const censorWord = (input: string) => {
  const matches = obscenityMatcher.getAllMatches(input)
  if (!matches.length) {
    return input
  }
  Sentry.captureMessage('censored obscenity', { extra: { input, matches } })
  const censor = new TextCensor()
  return censor.applyTo(input, matches)
}
