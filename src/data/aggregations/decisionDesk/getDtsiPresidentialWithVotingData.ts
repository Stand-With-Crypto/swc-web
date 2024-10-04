import { DTSI_UnitedStatesPresidentialQuery } from '@/data/dtsi/generated'
import { queryDTSILocationUnitedStatesPresidential } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesPresidentialInformation'
import { fetchElectoralCollege } from '@/utils/server/decisionDesk/services'
import { convertToOnlyEnglishCharacters } from '@/utils/shared/convertToOnlyEnglishCharacters'

interface VotingData {
  id: number
  firstName: string
  lastName: string
  votes: number
  percentage: number
  electoralVotes: number
  partyName: string
}

export type PresidentialDataWithVotingResponse = Array<
  DTSI_UnitedStatesPresidentialQuery['people'][0] & {
    votingData?: VotingData
  }
>

const normalizeName = (name: string) => {
  return convertToOnlyEnglishCharacters(name.toLowerCase().trim()).replace(/[.-\s]/g, '')
}

const getPoliticianFindMatch = (
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

async function getPresidentialData(year = '2024') {
  const { candidates } = await fetchElectoralCollege(year)

  if (!candidates) {
    return []
  }

  return candidates.map(currentCandidate => {
    return {
      id: currentCandidate.cand_id,
      firstName: currentCandidate.first_name,
      lastName: currentCandidate.last_name,
      votes: currentCandidate.votes,
      percentage: currentCandidate.percentage,
      electoralVotes: currentCandidate.electoral_votes_total,
      partyName: currentCandidate.party_name,
    }
  })
}

export async function getDtsiPresidentialWithVotingData(
  year = '2024',
): Promise<PresidentialDataWithVotingResponse> {
  const presidentialData = await getPresidentialData(year)
  const dtsiData = await queryDTSILocationUnitedStatesPresidential()

  return dtsiData.people.map(currentPolitician => {
    const votingData = presidentialData.find(currentVotingData => {
      const [currentPoliticianFirstName] = currentPolitician.firstName.split(' ')
      const [currentPoliticianLastName] = currentPolitician.lastName.split(' ')

      const normalizedPoliticianFirstName = normalizeName(currentPoliticianFirstName)
      const normalizedPoliticianLastName = normalizeName(currentPoliticianLastName)
      const normalizedVotingDataFirstName = normalizeName(currentVotingData.firstName)
      const normalizedVotingDataLastName = normalizeName(currentVotingData.lastName)

      return getPoliticianFindMatch(
        normalizedPoliticianFirstName,
        normalizedPoliticianLastName,
        normalizedVotingDataFirstName,
        normalizedVotingDataLastName,
      )
    })

    return {
      ...currentPolitician,
      votingData,
    }
  })
}
