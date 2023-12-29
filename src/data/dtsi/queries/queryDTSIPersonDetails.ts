import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import { fragmentDTSIPersonTableRow } from '@/data/dtsi/fragments/fragmentDTSIPersonTableRow'
import { DTSI_PersonDetailsQuery, DTSI_PersonDetailsQueryVariables } from '@/data/dtsi/generated'
import { REPLACE_ME__captureException } from '@/utils/shared/captureException'
import _ from 'lodash'

// TODO add people filter for promoted
export const query = /* GraphQL */ `
  query PersonDetails($slugIn: [String!]) {
    people(limit: 1, offset: 0, slugIn: $slugIn) {
      id
      twitterAccounts {
        id
        state
        username
      }
      suffixName
      slug
      roles {
        dateEnd
        dateStart
        group {
          id
          category
          displayName
          dateStart
          dateEnd
          primaryCity
          primaryCountryCode
          primaryDistrict
          primaryState
          parentGroup {
            id
            category
            displayName
            dateStart
            dateEnd
            primaryCity
            primaryCountryCode
            primaryDistrict
            primaryState
            parentGroup {
              id
              displayName
              dateStart
              dateEnd
              primaryCity
              primaryCountryCode
              primaryDistrict
              primaryState
              category
            }
          }
        }
        id
        isPubliclyVisible
        primaryCity
        primaryCountryCode
        primaryDistrict
        primaryState
        roleCategory
        status
        title
      }
      firstName
      firstNickname
      gender
      lastName
      manuallyOverriddenStanceScore
      middleName
      nameSuffix
      nameUniquenessModifier
      officialUrl
      phoneNumber
      politicalAffiliationCategory
      politicalAffiliation
      computedStanceScore
      manuallyOverriddenStanceScore
      stances(verificationStatusIn: APPROVED) {
        computedStanceScore
        dateStanceMade
        id
        stanceType
        billRelationship {
          id
          relationshipType
          bill {
            id
            title
            summary
            status
            slug
            shortTitle
            formattedSlug
            dateIntroduced
            computedStanceScore
          }
        }
        quote {
          richTextDescription
          sourceUrl
        }
        tweet {
          datetimeCreatedOnTwitter
          entities
          id
          twitterAccount {
            datetimeCreated
            id
            username
            state
          }
          tweetMedia {
            height
            id
            originalUrl
            url
            width
          }
          text
        }
      }
      profilePictureUrl
      profilePictureUrlDimensions
    }
  }
`
/*
Because this request returns so many results, we should ensure we're only triggering this logic in cached endpoints/routes
*/
export const queryDTSIPersonDetails = async (slug: string) => {
  const results = await fetchDTSI<DTSI_PersonDetailsQuery, DTSI_PersonDetailsQueryVariables>(
    query,
    { slugIn: [slug] },
  )
  if (results.people.length !== 1) {
    throw new Error(`queryDTSIPersonDetails: expected 1 person, got ${results.people.length}`)
  }
  return results.people[0]
}

export type DTSIPersonDetails = DTSI_PersonDetailsQuery['people'][0]
