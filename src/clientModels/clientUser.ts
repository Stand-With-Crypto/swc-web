import { User } from '@prisma/client'

export type ClientUser = Pick<
  User,
  'address' | 'id' | 'sampleDatabaseIncrement' | 'datetimeCreated' | 'datetimeUpdated'
>

export const getClientUser = (user: User): ClientUser => {
  const { address, id, sampleDatabaseIncrement, datetimeCreated, datetimeUpdated } = user
  return {
    address,
    id,
    sampleDatabaseIncrement,
    datetimeCreated,
    datetimeUpdated,
  }
}
