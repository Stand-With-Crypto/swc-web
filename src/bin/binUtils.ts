import prettier from 'prettier'
import path from 'path'
import fs from 'fs-extra'
import { prismaClient } from '@/utils/server/prismaClient'
import { REPLACE_ME__captureException } from '@/utils/shared/captureException'

export const runBin = async (fn: (...args: any[]) => Promise<any>) => {
  return fn()
    .then(async () => {
      await prismaClient.$disconnect()
    })
    .catch(async (e: any) => {
      REPLACE_ME__captureException(e)
      await prismaClient.$disconnect()
      process.exit(1)
    })
}

export const persistJSONToStaticContentFolder = async (restOfPath: string, json: object) => {
  const filePath = path.join(__dirname, '../staticContent', restOfPath)
  const formattedJSON = await prettier.format(JSON.stringify(json), { parser: 'json' })
  await fs.outputFile(filePath, formattedJSON)
}
