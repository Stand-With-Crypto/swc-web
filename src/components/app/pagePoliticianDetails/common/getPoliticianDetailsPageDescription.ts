import { PoliticianDetails } from '@/components/app/pagePoliticianDetails/common/types'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import {
  convertDTSIPersonStanceScoreToLetterGrade,
  DTSILetterGrade,
} from '@/utils/dtsi/dtsiStanceScoreUtils'

export function getPoliticianDetailsPageDescription(person: PoliticianDetails) {
  const fullName = dtsiPersonFullName(person)
  if (!person.stancesCount) {
    return `${fullName} has not made any recent comments about Bitcoin, Ethereum, and cryptocurrency innovation.`
  }
  const indication = (() => {
    switch (convertDTSIPersonStanceScoreToLetterGrade(person)) {
      case DTSILetterGrade.A:
        return 'indicated they are very pro-cryptocurrencies'
      case DTSILetterGrade.B:
        return 'indicated thy are somewhat pro-cryptocurrencies'
      case DTSILetterGrade.C:
      case null:
        return 'not indicated whether they are for or against cryptocurrencies.'
      case DTSILetterGrade.D:
        return 'indicated they are somewhat anti-cryptocurrencies'
      case DTSILetterGrade.F:
        return 'indicated they are very anti-cryptocurrencies'
    }
  })()
  return `Based on previous comments, ${fullName} has ${indication}. On this page you can view the tweets, quotes, and other commentary ${fullName} has made about Bitcoin, Ethereum, and cryptocurrency innovation.`
}
