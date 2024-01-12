import { LocalUser } from '@/utils/web/localUser'
import { User } from '@prisma/client'

export function mapLocalUserToUserDatabaseFields(
  localUser: LocalUser,
): Pick<
  User,
  'acquisitionReferer' | 'acquisitionSource' | 'acquisitionMedium' | 'acquisitionCampaign'
> {
  return {
    acquisitionReferer: localUser.persisted?.initialReferer || '',
    acquisitionSource:
      localUser.persisted?.initialSearchParams.utm_source ||
      localUser.currentSession.searchParamsOnLoad.utm_source ||
      '',
    acquisitionMedium:
      localUser.persisted?.initialSearchParams.utm_medium ||
      localUser.currentSession.searchParamsOnLoad.utm_medium ||
      '',
    acquisitionCampaign:
      localUser.persisted?.initialSearchParams.utm_campaign ||
      localUser.currentSession.searchParamsOnLoad.utm_campaign ||
      '',
  }
}
