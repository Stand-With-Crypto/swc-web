import * as Sentry from '@sentry/nextjs'
import { http, Address } from 'viem'
import { mainnet } from 'viem/chains'
import { createEnsPublicClient } from '@ensdomains/ensjs'
import { getName, getRecords, GetNameReturnType } from '@ensdomains/ensjs/public'
import _ from 'lodash'
import { formatENSAvatar } from '@/utils/server/formatENSAvatar'
import { UserENSData } from './types'

// TODO figure out if there's a more performant way of fetching this data with a better RPC
const client = createEnsPublicClient({
  chain: mainnet,
  transport: http(),
})

async function _getENSDataMapFromCryptoAddresses(
  addresses: string[],
): Promise<Record<string, UserENSData>> {
  const nameResult: Array<GetNameReturnType | null> = await Promise.all(
    addresses.map(address => getName(client, { address: address as Address })),
  )
  const addressesWithENS = nameResult
    .map((result, index) => ({
      cryptoAddress: addresses[index],
      ensName: result?.name || null,
    }))
    .filter(({ ensName }) => ensName)
  // TODO figure out how to fetch the name and records in a single call
  const records = await client.ensBatch(
    ...addressesWithENS.map(address =>
      getRecords.batch({
        name: address.ensName!,
        records: {
          texts: ['avatar'],
        },
      }),
    ),
  )
  return _.keyBy(
    addressesWithENS.map(({ cryptoAddress, ensName }, index) => {
      const record = records[index]
      const avatar = record.texts.find(text => text.key === 'avatar')?.value
      return {
        cryptoAddress,
        ensName,
        ensAvatarUrl: avatar ? formatENSAvatar(avatar) : null,
      }
    }),
    x => x.cryptoAddress,
  )
}

export async function getENSDataMapFromCryptoAddressesAndFailGracefully(addresses: string[]) {
  /*
  For now we always want to fail gracefully if we can't fetch the ENS data
  This may change in the future
  */
  const results = await _getENSDataMapFromCryptoAddresses(addresses).catch(e => {
    Sentry.captureException(e, {
      extra: { addresses },
      tags: { domain: 'getENSDataMapFromCryptoAddressesAndFailGracefully' },
    })
    const emptyObj: Record<string, UserENSData> = {}
    return emptyObj
  })
  return results
}

export async function getENSDataFromCryptoAddressAndFailGracefully(
  address: string,
): Promise<UserENSData | null> {
  const results = await getENSDataMapFromCryptoAddressesAndFailGracefully([address])
  if (results[address]) {
    return results[address]
  }
  return null
}
