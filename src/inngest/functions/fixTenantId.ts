import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'

const FIX_TENANT_ID_INNGEST_FUNCTION_ID = 'fix-tenant-id'
const FIX_TENANT_ID_INNGEST_EVENT_NAME = 'fix.tenant.id'

export interface FixTenantIdInngestEventSchema {
  name: typeof FIX_TENANT_ID_INNGEST_EVENT_NAME
  data: {
    persist: boolean
  }
}

export const fixTenantIdWithInngest = inngest.createFunction(
  {
    id: FIX_TENANT_ID_INNGEST_FUNCTION_ID,
    retries: 0,
  },
  { event: FIX_TENANT_ID_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const { persist } = event.data

    await step.run('update users table', async () => {
      const usersWithWrongTenantId: Array<{ id: string; tenant_id: string }> =
        await prismaClient.$queryRaw`
        SELECT id, tenant_id FROM user WHERE tenant_id COLLATE utf8mb4_bin LIKE 'US';
      `

      console.log('Users with wrong tenantId')
      console.table(
        usersWithWrongTenantId.map(user => ({
          id: user.id,
          tenantId: user.tenant_id,
          status: 'needs update',
        })),
      )

      if (!persist) return

      await prismaClient.user.updateMany({
        where: {
          id: { in: usersWithWrongTenantId.map(user => user.id) },
        },
        data: {
          tenantId: 'us',
        },
      })

      console.table(usersWithWrongTenantId.map(user => ({ id: user.id, status: 'updated' })))
    })

    await step.run('update user actions table', async () => {
      const userActionsWithWrongTenantId: Array<{ id: string; tenant_id: string }> =
        await prismaClient.$queryRaw`
        SELECT id, tenant_id FROM user_action WHERE tenant_id COLLATE utf8mb4_bin LIKE 'US';
      `

      console.log('User Actions with wrong tenantId')
      console.table(
        userActionsWithWrongTenantId.map(userAction => ({
          id: userAction.id,
          tenantId: userAction.tenant_id,
          status: 'needs update',
        })),
      )

      if (!persist) return

      await prismaClient.userAction.updateMany({
        where: {
          id: { in: userActionsWithWrongTenantId.map(userAction => userAction.id) },
        },
        data: {
          tenantId: 'us',
        },
      })

      console.table(
        userActionsWithWrongTenantId.map(userAction => ({ id: userAction.id, status: 'updated' })),
      )
    })

    await step.run('update user action opt in table', async () => {
      const optInUserActionsWithWrongTenantId: Array<{ id: string; tenant_id: string }> =
        await prismaClient.$queryRaw`
        SELECT id, tenant_id FROM user_action_opt_in WHERE tenant_id COLLATE utf8mb4_bin LIKE 'US';
      `

      console.log('Opt In User Actions with wrong tenantId')
      console.table(
        optInUserActionsWithWrongTenantId.map(optInUserAction => ({
          id: optInUserAction.id,
          tenantId: optInUserAction.tenant_id,
          status: 'needs update',
        })),
      )

      if (!persist) return

      await prismaClient.userActionOptIn.updateMany({
        where: {
          id: { in: optInUserActionsWithWrongTenantId.map(optInUserAction => optInUserAction.id) },
        },
        data: {
          tenantId: 'us',
        },
      })

      console.table(
        optInUserActionsWithWrongTenantId.map(optInUserAction => ({
          id: optInUserAction.id,
          status: 'updated',
        })),
      )
    })

    await step.run('update nft mint table', async () => {
      const nftMintWithWrongTenantId: Array<{ id: string; tenant_id: string }> =
        await prismaClient.$queryRaw`
        SELECT id, tenant_id FROM nft_mint WHERE tenant_id COLLATE utf8mb4_bin LIKE 'US';
      `

      console.log('NFT mint with wrong tenantId')
      console.table(
        nftMintWithWrongTenantId.map(nftMint => ({
          id: nftMint.id,
          tenantId: nftMint.tenant_id,
          status: 'needs update',
        })),
      )

      if (!persist) return

      await prismaClient.nFTMint.updateMany({
        where: {
          id: { in: nftMintWithWrongTenantId.map(nftMint => nftMint.id) },
        },
        data: {
          tenantId: 'us',
        },
      })

      console.table(
        nftMintWithWrongTenantId.map(nftMint => ({
          id: nftMint.id,
          status: 'updated',
        })),
      )
    })

    await step.run('update user communication journey table', async () => {
      const communicationJourneyWithWrongTenantId: Array<{ id: string; tenant_id: string }> =
        await prismaClient.$queryRaw`
        SELECT id, tenant_id FROM user_communication_journey WHERE tenant_id COLLATE utf8mb4_bin LIKE 'US';
      `

      console.log('User communication journey with wrong tenantId')
      console.table(
        communicationJourneyWithWrongTenantId.map(communicationJourney => ({
          id: communicationJourney.id,
          tenantId: communicationJourney.tenant_id,
          status: 'needs update',
        })),
      )

      if (!persist) return

      await prismaClient.userCommunicationJourney.updateMany({
        where: {
          id: {
            in: communicationJourneyWithWrongTenantId.map(
              communicationJourney => communicationJourney.id,
            ),
          },
        },
        data: {
          tenantId: 'us',
        },
      })

      console.table(
        communicationJourneyWithWrongTenantId.map(communicationJourney => ({
          id: communicationJourney.id,
          status: 'updated',
        })),
      )
    })

    await step.run('update user email address table', async () => {
      const emailAddressesWithWrongTenantId: Array<{ id: string; tenant_id: string }> =
        await prismaClient.$queryRaw`
        SELECT id, tenant_id FROM user_email_address WHERE tenant_id COLLATE utf8mb4_bin LIKE 'US';
      `

      console.log('User Email Addresses with wrong tenantId')
      console.table(
        emailAddressesWithWrongTenantId.map(emailAddress => ({
          id: emailAddress.id,
          tenantId: emailAddress.tenant_id,
          status: 'needs update',
        })),
      )

      if (!persist) return

      await prismaClient.userEmailAddress.updateMany({
        where: {
          id: { in: emailAddressesWithWrongTenantId.map(emailAddress => emailAddress.id) },
        },
        data: {
          tenantId: 'us',
        },
      })

      console.table(
        emailAddressesWithWrongTenantId.map(emailAddress => ({
          id: emailAddress.id,
          status: 'updated',
        })),
      )
    })

    await step.run('update address table', async () => {
      const addressesWithWrongTenantId: Array<{ id: string; tenant_id: string }> =
        await prismaClient.$queryRaw`
        SELECT id, tenant_id FROM address WHERE tenant_id COLLATE utf8mb4_bin LIKE 'US';
      `

      console.log('Addresses with wrong tenantId')
      console.table(
        addressesWithWrongTenantId.map(address => ({
          id: address.id,
          tenantId: address.tenant_id,
          status: 'needs update',
        })),
      )

      if (!persist) return

      await prismaClient.address.updateMany({
        where: {
          id: { in: addressesWithWrongTenantId.map(address => address.id) },
        },
        data: {
          tenantId: 'us',
        },
      })

      console.table(
        addressesWithWrongTenantId.map(address => ({
          id: address.id,
          status: 'updated',
        })),
      )
    })

    return {
      dryRun: !persist,
    }
  },
)
