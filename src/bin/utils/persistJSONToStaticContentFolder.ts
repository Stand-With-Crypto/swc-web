import prettier from 'prettier'
import path from 'path'
import fs from 'fs-extra'

export async function persistJSONToStaticContentFolder(restOfPath: string, json: object) {
  const filePath = path.join(__dirname, '../../staticContent', restOfPath)
  const formattedJSON = await prettier.format(JSON.stringify(json), { parser: 'json' })
  await fs.outputFile(filePath, formattedJSON)
}
