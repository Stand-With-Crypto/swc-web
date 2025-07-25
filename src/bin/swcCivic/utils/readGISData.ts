import fs from 'fs'
import { Feature, Geometry } from 'geojson'
import { ogr2ogr } from 'ogr2ogr'

interface GISData {
  type: string
  features: Feature<Geometry, { [key: string]: string }>[]
}

export async function readGISData(dataFilePath: string) {
  if (!fs.existsSync(dataFilePath) && !dataFilePath.startsWith('https')) {
    console.error(`\nError: File ${dataFilePath} does not exist`)
    return
  }

  try {
    const { data } = await ogr2ogr(dataFilePath, {
      maxBuffer: 1024 * 1024 * 400, // 400MB
    })

    if (!data) {
      console.error(`Error: No data returned from ogr2ogr for ${dataFilePath}`)
      return
    }

    const geojsonData = data as unknown as GISData

    return geojsonData
  } catch (error) {
    console.error(`Error reading GIS data from ${dataFilePath}:`, error)
    return
  }
}
