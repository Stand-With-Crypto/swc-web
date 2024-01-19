import { formatENSAvatar } from '@/utils/server/formatENSAvatar'
import { thirdwebRPCClient } from '@/utils/server/thirdweb/thirdwebRPCClient'
import * as Sentry from '@sentry/nextjs'
import _ from 'lodash'
import { Address } from 'viem'
import { UserENSData } from './types'

const client = thirdwebRPCClient

async function _getENSDataMapFromCryptoAddresses(
  _addresses: string[],
): Promise<Record<string, UserENSData>> {
  const addresses = _addresses as Address[]
  const nameResult = await Promise.all(addresses.map(address => client.getEnsName({ address })))
  const addressesWithENS = nameResult
    .map((result, index) => ({
      cryptoAddress: addresses[index],
      ensName: result,
    }))
    .filter(({ ensName }) => ensName)
  // TODO figure out how to fetch the name and records in a single call
  const records = await Promise.all(
    addressesWithENS.map(address =>
      client.getEnsAvatar({
        name: address.ensName!,
      }),
    ),
  )
  return _.keyBy(
    addressesWithENS.map(({ cryptoAddress, ensName }, index) => {
      const avatar = records[index]
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
