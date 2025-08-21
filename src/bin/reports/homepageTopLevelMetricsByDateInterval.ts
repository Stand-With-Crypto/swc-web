import { runBin } from '@/bin/runBin'
import { getCountPolicymakerContacts } from '@/data/aggregations/getCountPolicymakerContacts'
import { getCountUsers } from '@/data/aggregations/getCountUsers'

/**
 * Please, remember to set the environment variable NEXT_PUBLIC_ENVIRONMENT to "production"
 */
async function homepageTopLevelMetricsByDateInterval() {
  const startDate = new Date('2025-08-14T00:00:00Z')
  const endDate = new Date('2025-08-21T23:59:59Z')

  console.log(`startDate: ${startDate.toLocaleDateString()}`)
  console.log(`endDate: ${endDate.toLocaleDateString()}`)

  const [countPolicymakerContacts, countUsers] = await Promise.all([
    getCountPolicymakerContacts({
      customEmailCountWhere: {
        userActionEmail: {
          userAction: {
            datetimeCreated: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
      customCallCountWhere: {
        datetimeCreated: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    getCountUsers({
      datetimeCreated: {
        gte: startDate,
        lte: endDate,
      },
    }),
  ])

  console.log(`\ncountPolicymakerContacts:`, countPolicymakerContacts)

  const totalPolicymakerContacts =
    countPolicymakerContacts.countUserActionEmailRecipients +
    countPolicymakerContacts.countUserActionCalls

  console.log(`\n\nTotal Policymaker Contacts: ${totalPolicymakerContacts}`)
  console.log(`Total Users: ${countUsers.count}`)
}

void runBin(homepageTopLevelMetricsByDateInterval)
