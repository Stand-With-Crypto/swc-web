interface LatLong {
  latitude: number
  longitude: number
}

export interface GetConstituencyResult {
  name: string
  stateCode?: string
}

export type GetConstituencyQuery = (params: LatLong) => Promise<GetConstituencyResult | undefined>
