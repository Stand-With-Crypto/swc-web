import * as Sentry from '@sentry/nextjs'
import { compact } from 'lodash-es'

import { formatENSAvatar } from '@/utils/server/formatENSAvatar'
import { thirdwebRPCClient } from '@/utils/server/thirdweb/thirdwebRPCClients'
import { IS_DEVELOPING_OFFLINE } from '@/utils/shared/executionEnvironment'
import { raceAll } from '@/utils/shared/raceAll'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { stringToEthereumAddress } from '@/utils/shared/stringToEthereumAddress'

import { UserENSData } from './types'

const client = thirdwebRPCClient

async function _getENSDataMapFromCryptoAddresses(
  _addresses: string[],
): Promise<Record<string, UserENSData>> {
  const addresses = compact(_addresses.map(addr => stringToEthereumAddress(addr)))

  const nameResult = await raceAll(
    addresses.map(address =>
      client.getEnsName({ address }).catch(e => {
        Sentry.captureException(e, { extra: { address } })
        return null
      }),
    ),
    SECONDS_DURATION['10_SECONDS'] * 1000,
  )

  const addressesWithENS = nameResult
    .map((result, index) => ({
      cryptoAddress: addresses[index],
      ensName: result,
    }))
    .filter(({ ensName }) => ensName)

  const records = await raceAll(
    addressesWithENS.map(address =>
      client.getEnsAvatar({
        name: address.ensName!,
      }),
    ),
    SECONDS_DURATION['10_SECONDS'] * 1000,
  )

  return addressesWithENS.reduce(
    (acc, { cryptoAddress, ensName }, index) => {
      const avatar = records[index]
      acc[cryptoAddress] = {
        cryptoAddress,
        ensName,
        ensAvatarUrl: avatar ? formatENSAvatar(avatar) : null,
      }
      return acc
    },
    {} as Record<string, UserENSData>,
  )
}

export async function getENSDataMapFromCryptoAddressesAndFailGracefully(addresses: string[]) {
  if (IS_DEVELOPING_OFFLINE) {
    return {}
  }
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
