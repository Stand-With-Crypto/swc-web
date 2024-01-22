import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('maybeUpdateModel')

export function maybeUpdateModel<P extends object, F extends (payload: P) => Promise<E>>({
  payload,
  onUpdate,
  entity,
}: {
  payload: P
  onUpdate: F
  entity: E
}) {
  const keysToUpdate = Object.keys(payload)
  if (keysToUpdate.length) {
    logger.info(`updating the following model fields ${keysToUpdate.join(', ')}`)
    return onUpdate(payload)
  }
  return entity
}
