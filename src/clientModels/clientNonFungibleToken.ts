import { NonFungibleToken } from '@prisma/client'

export type ClientNonFungibleToken = Pick<
  NonFungibleToken,
  'id' | 'name' | 'cost' | 'costCurrencyCode'
>

export const getClientNonFungibleToken = (record: NonFungibleToken): ClientNonFungibleToken => {
  const { id, name, cost, costCurrencyCode } = record
  return {
    id,
    name,
    cost,
    costCurrencyCode,
  }
}
