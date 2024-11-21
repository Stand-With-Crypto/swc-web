const optOutKeywords = ['STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT', 'STOP']
const helpKeywords = ['HELP']
const unstopKeywords = ['YES', 'START', 'CONTINUE', 'UNSTOP']

export function identifyIncomingKeyword(keyword: string | undefined) {
  if (!keyword || keyword.length === 0) return

  const normalizedKeyword = keyword?.toUpperCase().trim()

  return {
    isOptOutKeyword: optOutKeywords.includes(normalizedKeyword),
    isHelpKeyword: helpKeywords.includes(normalizedKeyword),
    isUnstopKeyword: unstopKeywords.includes(normalizedKeyword),
  }
}
