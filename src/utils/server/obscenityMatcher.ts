// I have concerns about the bundle size of this being imported to the client
import 'server-only'

import * as Sentry from '@sentry/nextjs'
import {
  englishDataset,
  englishRecommendedTransformers,
  RegExpMatcher,
  TextCensor,
} from 'obscenity'

export const obscenityMatcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
})

export const hasBadWord = (input: string) => {
  const matches = obscenityMatcher.hasMatch(input)
  if (matches) {
    Sentry.captureMessage('Detected obscenity', { extra: { input } })
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
