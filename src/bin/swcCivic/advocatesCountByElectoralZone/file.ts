import { readFileSync, writeFileSync } from 'fs'

import { FileName } from '@/bin/swcCivic/advocatesCountByElectoralZone/types'

const LOCAL_CACHE_PATH = './src/bin/localCache'

const ENCODING = 'utf8'

function getFileNameWithPath(name: FileName) {
  return `${LOCAL_CACHE_PATH}/${name}`
}

export function readFile(name: FileName) {
  const url = getFileNameWithPath(name)

  return readFileSync(url, ENCODING)
}

export function writeFile(name: FileName, content: string) {
  const url = getFileNameWithPath(name)

  writeFileSync(url, content, {
    encoding: ENCODING,
    flag: 'w',
  })
}
