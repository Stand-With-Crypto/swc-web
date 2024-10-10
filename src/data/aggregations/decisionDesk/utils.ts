import { convertToOnlyEnglishCharacters } from '@/utils/shared/convertToOnlyEnglishCharacters'

interface GetPoliticianFindMatch {
  dtsiPerson: { politicianFirstName: string; politicianLastName: string }
  decisionDeskPerson: {
    votingDataFirstName: string
    votingDataLastName: string
  }
}
export const getPoliticianFindMatch = ({
  dtsiPerson,
  decisionDeskPerson,
}: GetPoliticianFindMatch) => {
  const { politicianFirstName, politicianLastName } = dtsiPerson
  const { votingDataFirstName, votingDataLastName } = decisionDeskPerson

  if (politicianFirstName === votingDataFirstName && politicianLastName === votingDataLastName) {
    return true
  }

  if (
    politicianFirstName.startsWith(votingDataFirstName) &&
    politicianLastName.startsWith(votingDataLastName)
  ) {
    return true
  }

  if (
    votingDataFirstName.startsWith(politicianFirstName) &&
    votingDataLastName.startsWith(politicianLastName)
  ) {
    return true
  }

  return false
}

export const normalizeName = (name: string) => {
  return convertToOnlyEnglishCharacters(name.toLowerCase().trim()).replace(/[.-\s]/g, '')
}
