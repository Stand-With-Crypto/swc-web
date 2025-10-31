import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export function getUserActionLetterTemplateId(templateIds: { test: string; live: string }) {
  switch (NEXT_PUBLIC_ENVIRONMENT) {
    case 'production':
      return templateIds.live
    default:
      return templateIds.test
  }
}
