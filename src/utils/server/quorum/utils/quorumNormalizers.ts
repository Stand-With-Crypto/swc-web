import { convertToOnlyEnglishCharacters } from '@/utils/shared/convertToOnlyEnglishCharacters'

export function normalizeQuorumString(str: string) {
  return convertToOnlyEnglishCharacters(
    str
      .normalize('NFD')
      .trim()
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.’']/g, '')
      .toLowerCase(),
  )
}

export function normalizeQuorumElectoralZone(electoralZone: string) {
  if (electoralZone === 'At-Large') {
    return '1'
  }

  return normalizeQuorumString(electoralZone)
    .replaceAll(/[\u2012\u2013\u2014\u2015]/g, '-')
    .replaceAll(' ', '-')
}
