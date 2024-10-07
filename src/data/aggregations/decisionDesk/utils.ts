import { convertToOnlyEnglishCharacters } from '@/utils/shared/convertToOnlyEnglishCharacters'

export const getPoliticianFindMatch = (
  politicianFirstName: string,
  politicianLastName: string,
  votingDataFirstName: string,
  votingDataLastName: string,
) => {
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
