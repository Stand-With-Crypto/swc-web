import { convertToOnlyEnglishCharacters } from '@/utils/shared/convertToOnlyEnglishCharacters'

const optOutKeywords = ['STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT', 'STOP']
const helpKeywords = ['HELP', 'INFO', 'AIDE']
const unstopKeywords = ['YES', 'START', 'CONTINUE', 'UNSTOP']

export function identifyIncomingKeyword(keyword: string | undefined) {
  if (!keyword || keyword.length === 0) return

  const normalizedKeyword = convertToOnlyEnglishCharacters(keyword)
    ?.toUpperCase()
    .trim()
    .replace(/\n/g, ' ')
    .replace(/".*?"/g, '') // Remove quoted content from message reactions (e.g., 'Liked "Thanks for subscribing..."' becomes 'Liked')

  const isOptOutKeyword =
    optOutKeywords.includes(normalizedKeyword) ||
    optOutKeywords.some(command => normalizedKeyword.startsWith(command))
  const isHelpKeyword = helpKeywords.includes(normalizedKeyword)
  const isUnstopKeyword = unstopKeywords.includes(normalizedKeyword)

  const hasKeyword = [...optOutKeywords, ...helpKeywords, ...unstopKeywords].some(command =>
    normalizedKeyword.includes(command),
  )

  return {
    value: normalizedKeyword,
    isOptOutKeyword,
    isHelpKeyword,
    isUnstopKeyword,
    isUnidentifiedKeyword: hasKeyword && !isOptOutKeyword && !isHelpKeyword && !isUnstopKeyword,
  }
}
