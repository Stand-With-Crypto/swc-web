import { parseISO } from 'date-fns'
import { times } from 'lodash-es'

import {
  DTSI_PersonGrouping,
  DTSI_PersonRole,
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleGroup,
  DTSI_PersonRoleGroupCategory,
  DTSI_PersonRoleStatus,
  DTSI_QueryResolvers,
} from '@/data/dtsi/generated'
import { dtsiPersonMockResolver } from '@/mocks/dtsi/mocks/dtsiPersonMockResolver'
import { dtsiPersonRoleMockResolver } from '@/mocks/dtsi/mocks/dtsiPersonRoleResolver'
import { REAL_CONGRESSPERSON_DATA } from '@/mocks/misc/congresspersonData'
import {
  CURRENT_SESSION_OF_CONGRESS,
  NEXT_SESSION_OF_CONGRESS,
} from '@/utils/dtsi/dtsiPersonRoleUtils'

function personRoleGroupingToPersonRoleMapping(
  grouping: DTSI_PersonGrouping,
): Partial<Omit<DTSI_PersonRole, 'group'> & { group: Partial<DTSI_PersonRoleGroup> }> {
  switch (grouping) {
    case DTSI_PersonGrouping.CURRENT_US_HOUSE_OF_REPS:
      return {
        roleCategory: DTSI_PersonRoleCategory.CONGRESS,
        primaryDistrict: `2`,
        primaryState: 'NY',
        primaryCountryCode: 'US',
        group: {
          category: DTSI_PersonRoleGroupCategory.CONGRESS,
          groupInstance: `${CURRENT_SESSION_OF_CONGRESS}`,
        },
        status: DTSI_PersonRoleStatus.HELD,
      }
    case DTSI_PersonGrouping.CURRENT_US_SENATE:
      return {
        roleCategory: DTSI_PersonRoleCategory.SENATE,
        primaryDistrict: ``,
        primaryState: 'NY',
        primaryCountryCode: 'US',
        group: {
          category: DTSI_PersonRoleGroupCategory.CONGRESS,
          groupInstance: `${CURRENT_SESSION_OF_CONGRESS}`,
        },
        status: DTSI_PersonRoleStatus.HELD,
      }
    case DTSI_PersonGrouping.RUNNING_FOR_PRESIDENT:
      return {
        primaryDistrict: ``,
        primaryState: '',
        primaryCountryCode: 'US',
        roleCategory: DTSI_PersonRoleCategory.PRESIDENT,
        status: DTSI_PersonRoleStatus.RUNNING_FOR,
        dateStart: parseISO('2029-01-20').toISOString(),
      }
    case DTSI_PersonGrouping.RUNNING_FOR_US_HOUSE_OF_REPS:
      return {
        roleCategory: DTSI_PersonRoleCategory.CONGRESS,
        primaryDistrict: `2`,
        primaryState: 'NY',
        primaryCountryCode: 'US',
        group: {
          category: DTSI_PersonRoleGroupCategory.CONGRESS,
          groupInstance: `${NEXT_SESSION_OF_CONGRESS}`,
        },
        status: DTSI_PersonRoleStatus.RUNNING_FOR,
      }
    case DTSI_PersonGrouping.RUNNING_FOR_US_SENATE:
      return {
        roleCategory: DTSI_PersonRoleCategory.SENATE,
        primaryDistrict: ``,
        primaryState: 'NY',
        primaryCountryCode: 'US',
        group: {
          category: DTSI_PersonRoleGroupCategory.CONGRESS,
          groupInstance: `${NEXT_SESSION_OF_CONGRESS}`,
        },
        status: DTSI_PersonRoleStatus.RUNNING_FOR,
      }
    case DTSI_PersonGrouping.NEXT_PRESIDENT:
      return {
        primaryDistrict: ``,
        primaryState: '',
        primaryCountryCode: 'US',
        roleCategory: DTSI_PersonRoleCategory.PRESIDENT,
        status: DTSI_PersonRoleStatus.HELD,
        dateStart: parseISO('2029-01-20').toISOString(),
      }
    case DTSI_PersonGrouping.NEXT_US_HOUSE_OF_REPS:
      return {
        roleCategory: DTSI_PersonRoleCategory.CONGRESS,
        primaryDistrict: `2`,
        primaryState: 'NY',
        primaryCountryCode: 'US',
        group: {
          category: DTSI_PersonRoleGroupCategory.CONGRESS,
          groupInstance: `${NEXT_SESSION_OF_CONGRESS}`,
        },
        status: DTSI_PersonRoleStatus.HELD,
      }
    case DTSI_PersonGrouping.NEXT_US_SENATE:
      return {
        roleCategory: DTSI_PersonRoleCategory.SENATE,
        primaryDistrict: ``,
        primaryState: 'NY',
        primaryCountryCode: 'US',
        group: {
          category: DTSI_PersonRoleGroupCategory.CONGRESS,
          groupInstance: `${NEXT_SESSION_OF_CONGRESS}`,
        },
        status: DTSI_PersonRoleStatus.HELD,
      }
    case DTSI_PersonGrouping.US_PRESIDENT:
      return {
        roleCategory: DTSI_PersonRoleCategory.PRESIDENT,
        primaryDistrict: ``,
        primaryState: '',
        primaryCountryCode: 'US',
        status: DTSI_PersonRoleStatus.HELD,
      }
    case DTSI_PersonGrouping.CURRENT_AU_HOUSE_OF_REPS:
      return {
        roleCategory: DTSI_PersonRoleCategory.CONGRESS,
        primaryDistrict: '',
        primaryState: 'NSW',
        primaryCountryCode: 'AU',
        status: DTSI_PersonRoleStatus.HELD,
      }
    case DTSI_PersonGrouping.CURRENT_AU_SENATE:
      return {
        roleCategory: DTSI_PersonRoleCategory.SENATE,
        primaryDistrict: '',
        primaryState: 'NSW',
        primaryCountryCode: 'AU',
        status: DTSI_PersonRoleStatus.HELD,
      }
    case DTSI_PersonGrouping.RUNNING_FOR_AU_HOUSE_OF_REPS:
      return {
        roleCategory: DTSI_PersonRoleCategory.CONGRESS,
        primaryDistrict: '',
        primaryState: 'NSW',
        primaryCountryCode: 'AU',
        status: DTSI_PersonRoleStatus.RUNNING_FOR,
      }
    case DTSI_PersonGrouping.RUNNING_FOR_AU_SENATE:
      return {
        roleCategory: DTSI_PersonRoleCategory.SENATE,
        primaryDistrict: '',
        primaryState: 'NSW',
        primaryCountryCode: 'AU',
        status: DTSI_PersonRoleStatus.RUNNING_FOR,
      }
    case DTSI_PersonGrouping.NEXT_AU_HOUSE_OF_REPS:
      return {
        roleCategory: DTSI_PersonRoleCategory.CONGRESS,
        primaryDistrict: '',
        primaryState: 'NSW',
        primaryCountryCode: 'AU',
        status: DTSI_PersonRoleStatus.HELD,
      }
    case DTSI_PersonGrouping.NEXT_AU_SENATE:
      return {
        roleCategory: DTSI_PersonRoleCategory.SENATE,
        primaryDistrict: '',
        primaryState: 'NSW',
        primaryCountryCode: 'AU',
        status: DTSI_PersonRoleStatus.HELD,
      }
    case DTSI_PersonGrouping.CURRENT_CA_HOUSE_OF_COMMONS:
      return {
        roleCategory: DTSI_PersonRoleCategory.HOUSE_OF_COMMONS,
        primaryDistrict: '',
        primaryState: 'ON',
        primaryCountryCode: 'CA',
        status: DTSI_PersonRoleStatus.HELD,
      }
    case DTSI_PersonGrouping.CURRENT_CA_SENATE:
      return {
        roleCategory: DTSI_PersonRoleCategory.SENATE,
        primaryDistrict: '',
        primaryState: 'ON',
        primaryCountryCode: 'CA',
        status: DTSI_PersonRoleStatus.HELD,
      }
    case DTSI_PersonGrouping.RUNNING_FOR_CA_HOUSE_OF_COMMONS:
      return {
        roleCategory: DTSI_PersonRoleCategory.HOUSE_OF_COMMONS,
        primaryDistrict: '',
        primaryState: 'ON',
        primaryCountryCode: 'CA',
        status: DTSI_PersonRoleStatus.RUNNING_FOR,
      }
    case DTSI_PersonGrouping.RUNNING_FOR_CA_SENATE:
      return {
        roleCategory: DTSI_PersonRoleCategory.SENATE,
        primaryDistrict: '',
        primaryState: 'ON',
        primaryCountryCode: 'CA',
        status: DTSI_PersonRoleStatus.RUNNING_FOR,
      }
    case DTSI_PersonGrouping.NEXT_CA_HOUSE_OF_COMMONS:
      return {
        roleCategory: DTSI_PersonRoleCategory.HOUSE_OF_COMMONS,
        primaryDistrict: '',
        primaryState: 'ON',
        primaryCountryCode: 'CA',
        status: DTSI_PersonRoleStatus.HELD,
      }
    case DTSI_PersonGrouping.NEXT_CA_SENATE:
      return {
        roleCategory: DTSI_PersonRoleCategory.SENATE,
        primaryDistrict: '',
        primaryState: 'ON',
        primaryCountryCode: 'CA',
        status: DTSI_PersonRoleStatus.HELD,
      }
    case DTSI_PersonGrouping.CURRENT_UK_HOUSE_OF_COMMONS:
      return {
        roleCategory: DTSI_PersonRoleCategory.HOUSE_OF_COMMONS,
        primaryDistrict: '',
        primaryState: 'England',
        primaryCountryCode: 'GB',
        status: DTSI_PersonRoleStatus.HELD,
      }
    case DTSI_PersonGrouping.CURRENT_UK_HOUSE_OF_LORDS:
      return {
        roleCategory: DTSI_PersonRoleCategory.HOUSE_OF_LORDS,
        primaryDistrict: '',
        primaryState: 'England',
        primaryCountryCode: 'GB',
        status: DTSI_PersonRoleStatus.HELD,
      }
    case DTSI_PersonGrouping.RUNNING_FOR_UK_HOUSE_OF_COMMONS:
      return {
        roleCategory: DTSI_PersonRoleCategory.HOUSE_OF_COMMONS,
        primaryDistrict: '',
        primaryState: 'England',
        primaryCountryCode: 'GB',
        status: DTSI_PersonRoleStatus.RUNNING_FOR,
      }
    case DTSI_PersonGrouping.RUNNING_FOR_UK_HOUSE_OF_LORDS:
      return {
        roleCategory: DTSI_PersonRoleCategory.HOUSE_OF_LORDS,
        primaryDistrict: '',
        primaryState: 'England',
        primaryCountryCode: 'GB',
        status: DTSI_PersonRoleStatus.RUNNING_FOR,
      }
    case DTSI_PersonGrouping.NEXT_UK_HOUSE_OF_COMMONS:
      return {
        roleCategory: DTSI_PersonRoleCategory.HOUSE_OF_COMMONS,
        primaryDistrict: '',
        primaryState: 'England',
        primaryCountryCode: 'GB',
        status: DTSI_PersonRoleStatus.HELD,
      }
    case DTSI_PersonGrouping.NEXT_UK_HOUSE_OF_LORDS:
      return {
        roleCategory: DTSI_PersonRoleCategory.HOUSE_OF_LORDS,
        primaryDistrict: '',
        primaryState: 'England',
        primaryCountryCode: 'GB',
        status: DTSI_PersonRoleStatus.HELD,
      }
  }
}

export const dtsiQueryResolver: Partial<DTSI_QueryResolvers> = {
  peopleByUSCongressionalDistrict: () => {
    const data = Object.values(DTSI_PersonRoleCategory).map(
      category =>
        ({
          ...dtsiPersonMockResolver(),
          primaryRole: dtsiPersonRoleMockResolver({
            roleCategory: category,
          }),
        }) as any,
    )
    data.push(...REAL_CONGRESSPERSON_DATA)
    return data
  },
  people: (_root, args) => {
    const total = args.slugIn ? args.slugIn.length : args.limit && args.limit > 1000 ? 750 : 10
    const roleGroupingFieldOptions =
      args.personRoleGroupingOr?.map(personRoleGroupingToPersonRoleMapping) || []
    const data = times(total).map((_, index) => {
      const maybeRoleGroupingInfo =
        roleGroupingFieldOptions[index % roleGroupingFieldOptions.length] || {}
      const slug = args.slugIn ? args.slugIn[index % args.slugIn.length] : undefined
      return {
        slug,
        roles: times(3).map((_item, roleIndex) => {
          if (!roleIndex) {
            return {
              ...maybeRoleGroupingInfo,
              primaryState: args.personRolePrimaryState || maybeRoleGroupingInfo.primaryState,
              primaryDistrict:
                args.personRolePrimaryDistrict || maybeRoleGroupingInfo.primaryDistrict,
              primaryCountryCode:
                args.personRolePrimaryCountryCode || maybeRoleGroupingInfo.primaryCountryCode,
              primaryCity: args.personRolePrimaryCity || maybeRoleGroupingInfo.primaryCity,
            }
          }
          return {}
        }),
      }
    })

    return data as any[]
  },
}
