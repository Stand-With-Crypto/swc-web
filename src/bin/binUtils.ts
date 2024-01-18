import prettier from 'prettier'
import path from 'path'
import fs from 'fs-extra'
import { prismaClient } from '@/utils/server/prismaClient'
import * as Sentry from '@sentry/nextjs'
// eslint-disable-next-line
import '../../sentry.server.config'

export const runBin = async (fn: (...args: any[]) => Promise<any>) => {
  return fn()
    .then(async () => {
      await prismaClient.$disconnect()
      await Sentry.flush(2000)
    })
    .catch(async (e: any) => {
      Sentry.captureException(e, { tags: { domain: 'runBin' } })
      await prismaClient.$disconnect()
      await Sentry.flush(2000)
      process.exit(1)
    })
}

export const persistJSONToStaticContentFolder = async (restOfPath: string, json: object) => {
  const filePath = path.join(__dirname, '../staticContent', restOfPath)
  const formattedJSON = await prettier.format(JSON.stringify(json), { parser: 'json' })
  await fs.outputFile(filePath, formattedJSON)
}
