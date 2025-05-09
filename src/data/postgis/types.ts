interface Params {
  latitude: number
  longitude: number
}

export interface GetCongressionalDistrictResult {
  congressionalDistrictName: string
  stateCode?: string
}

export type GetCongressionalDistrictQuery = (
  params: Params,
) => Promise<GetCongressionalDistrictResult | undefined>
