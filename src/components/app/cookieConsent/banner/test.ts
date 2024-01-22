import { prismaClient } from '@/utils/server/prismaClient'
import { Address, User } from '@prisma/client'

interface CapitalCanaryAdvocateAPIPayload {
  foo: 'bar'
}

interface CapitalCanaryAdvocateAPIDataRequirements {
  user: User & { address: Address | null }
}

function formatCapitalCanaryAdvocateAPIPayload(
  data: CapitalCanaryAdvocateAPIDataRequirements,
): CapitalCanaryAdvocateAPIPayload {
  return {
    foo: 'bar',
  }
}

export default inngest.createFunction(
  { id: 'import-product-images' },
  { event: 'shop/product.imported' },
  async ({ event, step }) => {
    const data = event.data as CapitalCanaryAdvocateAPIDataRequirements
    const apiPayload = formatCapitalCanaryAdvocateAPIPayload(data)
  },
)

// some other file

async function someAction() {
  const user = await prismaClient.user.findUnique({
    where: { id: '1' },
    include: { address: true },
  })
  const inngestPayload: CapitalCanaryAdvocateAPIDataRequirements = { user }
  await inngest.send({
    name: 'app/account.created',
    data: inngestPayload,
  })
}
