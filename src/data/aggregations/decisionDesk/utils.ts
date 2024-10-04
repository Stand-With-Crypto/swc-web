import { convertToOnlyEnglishCharacters } from '@/utils/shared/convertToOnlyEnglishCharacters'

export const getPoliticianFindMatch = (
  politicianFirstName: string,
  politicianLastName: string,
  votingDataFirstName: string,
  votingDataLastName: string,
) => {
  const normalizedPoliticianFirstName = normalizeName(politicianFirstName)
  const normalizedPoliticianLastName = normalizeName(politicianLastName)
  const normalizedVotingDataFirstName = normalizeName(votingDataFirstName)
  const normalizedVotingDataLastName = normalizeName(votingDataLastName)

  if (
    normalizedPoliticianFirstName === normalizedVotingDataFirstName &&
    normalizedPoliticianLastName === normalizedVotingDataLastName
  ) {
    return true
  }

  if (
    normalizedPoliticianFirstName.startsWith(normalizedVotingDataFirstName) &&
    normalizedPoliticianLastName.startsWith(normalizedVotingDataLastName)
  ) {
    return true
  }

  if (
    normalizedVotingDataFirstName.startsWith(normalizedPoliticianFirstName) &&
    normalizedVotingDataLastName.startsWith(normalizedPoliticianLastName)
  ) {
    return true
  }

  return false
}

const normalizeName = (name: string) => {
  return convertToOnlyEnglishCharacters(name.toLowerCase().trim()).replace(/[.-\s]/g, '')
}
