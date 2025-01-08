const optOutKeywords = ['STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT', 'STOP']
const helpKeywords = ['HELP']
const unstopKeywords = ['YES', 'START', 'CONTINUE', 'UNSTOP']

export function identifyIncomingKeyword(keyword: string | undefined) {
  if (!keyword || keyword.length === 0) return

  const normalizedKeyword = keyword?.toUpperCase().trim()

  const isOptOutKeyword = optOutKeywords.includes(normalizedKeyword)
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
