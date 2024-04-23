import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'

export const fragmentRaceSpecificPersonInfo = /* GraphQL */ `
  fragment RaceSpecificPersonInfo on Person {
    ...PersonCard
    roles {
      id
      primaryDistrict
      primaryState
      roleCategory
      status
      dateStart
      group {
        id
        category
        groupInstance
      }
    }
  }
  ${fragmentDTSIPersonCard}
`
