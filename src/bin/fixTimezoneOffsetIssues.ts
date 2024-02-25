import { addHours } from 'date-fns'
import { chunk } from 'lodash-es'

import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('fixTimezoneOffsetIssues')

type Entity = { id: string; datetimeCreated: Date; datetimeUpdated: Date }

// prevent fetching entities that were created post-migration
const MAX_DATETIME_CREATED = new Date() // TODO: set this to the date of the migration
const HOURS_OFFSET_TO_CHANGE = 0 // TODO

function fixDate(date: Date) {
  return addHours(date, HOURS_OFFSET_TO_CHANGE)
}

async function fixEntity({
  paginateRows,
  updateEntity,
  label,
}: {
  label: string
  paginateRows: (config: { skip: number; take: number }) => Promise<Array<Entity>>
  updateEntity: (entity: Entity) => Promise<void>
}) {
  const limit = 50
  let hasGoneThroughAllRecords = false
  logger.info(`starting ${label}`)
  let count = 0
  while (!hasGoneThroughAllRecords) {
    const entities = await paginateRows({
      skip: count * limit,
      take: limit,
    })
    logger.info(
      `processing ${label} ${(count + 1) * limit} - ${(count + 2) * limit}. length returned: ${entities.length}`,
    )
    const chunks = chunk(entities, 10)
    for (let i = 0; i < chunks.length; i++) {
      await Promise.all(
        chunks[i].map(async u => {
          const datetimeCreated = fixDate(u.datetimeCreated)
          const datetimeUpdated = fixDate(u.datetimeUpdated)
          return updateEntity({
            ...u,
            datetimeCreated,
            datetimeUpdated,
          })
        }),
      )
    }
    if (entities.length < limit) {
      hasGoneThroughAllRecords = true
    }
    count += 1
  }
}

async function fixTimezoneOffsetIssues() {
  await fixEntity({
    label: 'addresses',
    paginateRows: config =>
      prismaClient.address.findMany({
        ...config,
        where: { datetimeCreated: { lte: MAX_DATETIME_CREATED } },
        select: { id: true, datetimeCreated: true, datetimeUpdated: true },
      }),
    updateEntity: async entity => {
      await prismaClient.address.update({
        where: {
          id: entity.id,
        },
        data: {
          datetimeCreated: entity.datetimeCreated,
          datetimeUpdated: entity.datetimeUpdated,
        },
      })
    },
  })
  await fixEntity({
    label: 'users',
    paginateRows: config =>
      prismaClient.user.findMany({
        ...config,
        where: { datetimeCreated: { lte: MAX_DATETIME_CREATED } },
        select: { id: true, datetimeCreated: true, datetimeUpdated: true },
      }),
    updateEntity: async entity => {
      await prismaClient.user.update({
        where: {
          id: entity.id,
        },
        data: {
          datetimeCreated: entity.datetimeCreated,
          datetimeUpdated: entity.datetimeUpdated,
        },
      })
    },
  })
  await fixEntity({
    label: 'userSessions',
    paginateRows: config =>
      prismaClient.userSession.findMany({
        ...config,
        where: { datetimeCreated: { lte: MAX_DATETIME_CREATED } },
        select: { id: true, datetimeCreated: true, datetimeUpdated: true },
      }),
    updateEntity: async entity => {
      await prismaClient.userSession.update({
        where: {
          id: entity.id,
        },
        data: {
          datetimeCreated: entity.datetimeCreated,
          datetimeUpdated: entity.datetimeUpdated,
        },
      })
    },
  })
  await fixEntity({
    label: 'userEmailAddresses',
    paginateRows: config =>
      prismaClient.userEmailAddress.findMany({
        ...config,
        where: { datetimeCreated: { lte: MAX_DATETIME_CREATED } },
        select: { id: true, datetimeCreated: true, datetimeUpdated: true },
      }),
    updateEntity: async entity => {
      await prismaClient.userEmailAddress.update({
        where: {
          id: entity.id,
        },
        data: {
          datetimeCreated: entity.datetimeCreated,
          datetimeUpdated: entity.datetimeUpdated,
        },
      })
    },
  })
  await fixEntity({
    label: 'userActions',
    paginateRows: config =>
      prismaClient.userAction.findMany({
        ...config,
        where: { datetimeCreated: { lte: MAX_DATETIME_CREATED } },
        select: { id: true, datetimeCreated: true, datetimeUpdated: true },
      }),
    updateEntity: async entity => {
      await prismaClient.userAction.update({
        where: {
          id: entity.id,
        },
        data: {
          datetimeCreated: entity.datetimeCreated,
          datetimeUpdated: entity.datetimeUpdated,
        },
      })
    },
  })
  await fixEntity({
    label: 'userCryptoAddresses',
    paginateRows: config =>
      prismaClient.userCryptoAddress.findMany({
        ...config,
        where: { datetimeCreated: { lte: MAX_DATETIME_CREATED } },
        select: { id: true, datetimeCreated: true, datetimeUpdated: true },
      }),
    updateEntity: async entity => {
      await prismaClient.userCryptoAddress.update({
        where: {
          id: entity.id,
        },
        data: {
          datetimeCreated: entity.datetimeCreated,
          datetimeUpdated: entity.datetimeUpdated,
        },
      })
    },
  })
  await fixEntity({
    label: 'nftMints',
    paginateRows: config =>
      prismaClient.nFTMint.findMany({
        ...config,
        where: { datetimeCreated: { lte: MAX_DATETIME_CREATED } },
        select: { id: true, datetimeCreated: true, datetimeUpdated: true },
      }),
    updateEntity: async entity => {
      await prismaClient.nFTMint.update({
        where: {
          id: entity.id,
        },
        data: {
          datetimeCreated: entity.datetimeCreated,
          datetimeUpdated: entity.datetimeUpdated,
        },
      })
    },
  })
}

runBin(fixTimezoneOffsetIssues)
