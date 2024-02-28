import { UserActionType } from '@prisma/client'

import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('auditDatabaseIntegrity')

async function auditDatabaseIntegrity() {
  const [
    incompleteCallRelations,
    incompleteDonationRelations,
    incompleteEmailRelations,
    incompleteNFTMintRelations,
    incompleteOptInRelations,
    incompleteVoterRegistrationRelations,
  ] = await Promise.all([
    prismaClient.userAction.findMany({
      where: {
        actionType: UserActionType.CALL,
        userActionCall: null,
      },
    }),
    prismaClient.userAction.findMany({
      where: {
        actionType: UserActionType.DONATION,
        userActionDonation: null,
      },
    }),
    prismaClient.userAction.findMany({
      where: {
        actionType: UserActionType.EMAIL,
        userActionEmail: null,
      },
    }),
    prismaClient.userAction.findMany({
      where: {
        actionType: UserActionType.NFT_MINT,
        nftMint: null,
      },
    }),
    prismaClient.userAction.findMany({
      where: {
        actionType: UserActionType.OPT_IN,
        userActionOptIn: null,
      },
    }),
    prismaClient.userAction.findMany({
      where: {
        actionType: UserActionType.VOTER_REGISTRATION,
        userActionVoterRegistration: null,
      },
    }),
    prismaClient.userAction.findMany({
      where: {
        actionType: UserActionType.VOTER_REGISTRATION,
        userActionVoterRegistration: null,
      },
    }),
  ])
  const log = (incompleteRelations: any[], actionType: UserActionType) => {
    logger.info(`${incompleteCallRelations.length} incomplete ${actionType} relations:`)
    for (const relation of incompleteRelations) {
      logger.info(`-- ${relation.id}`)
    }
  }
  log(incompleteCallRelations, UserActionType.CALL)
  log(incompleteDonationRelations, UserActionType.DONATION)
  log(incompleteEmailRelations, UserActionType.EMAIL)
  log(incompleteNFTMintRelations, UserActionType.NFT_MINT)
  log(incompleteOptInRelations, UserActionType.OPT_IN)
  log(incompleteVoterRegistrationRelations, UserActionType.VOTER_REGISTRATION)
}

void runBin(auditDatabaseIntegrity)
