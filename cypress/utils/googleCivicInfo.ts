interface GoogleCivicInfoAddress {
  line1: string
  city: string
  state: string
  zip: string
}

export interface GoogleCivicInfoOfficial {
  name: string
  address: GoogleCivicInfoAddress[]
  party: string
  phones: string[]
  urls: string[]
  photoUrl: string
  channels: {
    type: string
    id: string
  }[]
}

export interface GoogleCivicInfoResponse {
  normalizedInput: GoogleCivicInfoAddress
  kind: 'civicinfo#representativeInfoResponse'
  divisions: Record<string, { name: string }>
  officials: GoogleCivicInfoOfficial[]
}
