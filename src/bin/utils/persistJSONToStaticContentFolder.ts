import fs from 'fs-extra'
import path from 'path'
import prettier from 'prettier'

export const persistJSONToStaticContentFolder = async (restOfPath: string, json: object) => {
  const filePath = path.join(__dirname, '../../staticContent', restOfPath)
  const formattedJSON = await prettier.format(JSON.stringify(json), { parser: 'json' })
  await fs.outputFile(filePath, formattedJSON)
}
