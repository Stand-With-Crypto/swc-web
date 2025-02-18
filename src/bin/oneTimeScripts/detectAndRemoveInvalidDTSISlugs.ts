import { runBin } from '@/bin/runBin'
import { queryDTSIAllPeopleSlugs } from '@/data/dtsi/queries/queryDTSIAllPeopleSlugs'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('bin:oneTimeScripts:detectAndRemoveInvalidDTSISlugs')

// Remember to set up DO_THEY_SUPPORT_IT_API_KEY env variable, otherwise the data will be mocked
async function run() {
  // npm run ts src/bin/oneTimeScripts/detectAndRemoveInvalidDTSISlugs.ts -- --persist
  const persist = process.argv.includes('--persist')

  logger.info(`Running with persist=${String(persist)}`)

  logger.info('Querying all DTSI slugs')

  const allSlugs = await queryDTSIAllPeopleSlugs()

  const slugs = allSlugs.people.map(({ slug }) => slug)

  logger.info(`Found ${slugs.length} slugs`)

  const getValidDTSIRandomSlug = () => slugs[Math.floor(Math.random() * slugs.length)]

  const invalidUserActionEmailRecipientsCount = await prismaClient.userActionEmailRecipient.count({
    where: {
      dtsiSlug: {
        notIn: slugs,
      },
    },
  })

  logger.info(`Found ${invalidUserActionEmailRecipientsCount} invalid userActionEmailRecipients`)

  if (persist) {
    const { count } = await prismaClient.userActionEmailRecipient.updateMany({
      data: {
        dtsiSlug: getValidDTSIRandomSlug(),
      },
      where: {
        dtsiSlug: {
          notIn: slugs,
        },
      },
    })
    logger.info(`Updated ${count} userActionEmailRecipients`)
  }

  const invalidUserActionCallsCount = await prismaClient.userActionCall.count({
    where: {
      recipientDtsiSlug: {
        notIn: slugs,
      },
    },
  })

  logger.info(`Found ${invalidUserActionCallsCount} invalid userActionCalls`)

  if (persist) {
    const { count } = await prismaClient.userActionCall.updateMany({
      data: {
        recipientDtsiSlug: getValidDTSIRandomSlug(),
      },
      where: {
        recipientDtsiSlug: {
          notIn: slugs,
        },
      },
    })
    logger.info(`Updated ${count} userActionCalls`)
  }

  const invalidUserActionTweetAtPersonCount = await prismaClient.userActionTweetAtPerson.count({
    where: {
      recipientDtsiSlug: {
        notIn: slugs,
      },
    },
  })

  logger.info(`Found ${invalidUserActionTweetAtPersonCount} invalid userActionTweetAtPersons`)

  if (persist) {
    const { count } = await prismaClient.userActionTweetAtPerson.updateMany({
      data: {
        recipientDtsiSlug: getValidDTSIRandomSlug(),
      },
      where: {
        recipientDtsiSlug: {
          notIn: slugs,
        },
      },
    })
    logger.info(`Updated ${count} userActionTweetAtPersons`)
  }
}

void runBin(run)
