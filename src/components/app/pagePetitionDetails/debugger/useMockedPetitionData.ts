import { useEffect, useMemo, useState } from 'react'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

// Mock city names for different countries
const MOCK_CITIES_BY_COUNTRY: Record<SupportedCountryCodes, string[]> = {
  [SupportedCountryCodes.US]: [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
    'Philadelphia, PA',
    'San Antonio, TX',
    'San Diego, CA',
    'Dallas, TX',
    'San Jose, CA',
    'Austin, TX',
    'Jacksonville, FL',
    'Fort Worth, TX',
    'Columbus, OH',
    'Charlotte, NC',
    'San Francisco, CA',
    'Indianapolis, IN',
    'Seattle, WA',
    'Denver, CO',
    'Washington, DC',
    'Boston, MA',
    'El Paso, TX',
    'Nashville, TN',
    'Detroit, MI',
    'Oklahoma City, OK',
    'Portland, OR',
    'Las Vegas, NV',
    'Memphis, TN',
    'Louisville, KY',
    'Baltimore, MD',
    'Milwaukee, WI',
    'Albuquerque, NM',
    'Tucson, AZ',
    'Fresno, CA',
    'Sacramento, CA',
    'Mesa, AZ',
    'Kansas City, MO',
    'Atlanta, GA',
    'Long Beach, CA',
    'Colorado Springs, CO',
    'Raleigh, NC',
    'Miami, FL',
    'Virginia Beach, VA',
    'Omaha, NE',
    'Oakland, CA',
    'Minneapolis, MN',
    'Tulsa, OK',
    'Arlington, TX',
    'Tampa, FL',
    'New Orleans, LA',
  ],
  [SupportedCountryCodes.GB]: [
    'London',
    'Birmingham',
    'Manchester',
    'Glasgow',
    'Liverpool',
    'Edinburgh',
    'Leeds',
    'Sheffield',
    'Bristol',
    'Cardiff',
    'Belfast',
    'Leicester',
    'Coventry',
    'Bradford',
    'Nottingham',
    'Kingston upon Hull',
    'Newcastle upon Tyne',
    'Stoke-on-Trent',
    'Southampton',
    'Derby',
    'Portsmouth',
    'Brighton',
    'Plymouth',
    'Northampton',
    'Reading',
    'Luton',
    'Wolverhampton',
    'Bolton',
    'Bournemouth',
    'Norwich',
    'Swindon',
    'Swansea',
    'Southend-on-Sea',
    'Middlesbrough',
    'Peterborough',
    'Cambridge',
    'Doncaster',
    'York',
    'Poole',
    'Gloucester',
    'Burnley',
    'Huddersfield',
    'Telford',
    'Dundee',
    'Blackpool',
    'Ipswich',
    'Oxford',
    'Warrington',
    'Slough',
    'Exeter',
  ],
  [SupportedCountryCodes.CA]: [
    'Toronto, ON',
    'Montreal, QC',
    'Vancouver, BC',
    'Calgary, AB',
    'Edmonton, AB',
    'Ottawa, ON',
    'Mississauga, ON',
    'Winnipeg, MB',
    'Quebec City, QC',
    'Hamilton, ON',
    'Brampton, ON',
    'Surrey, BC',
    'Laval, QC',
    'Halifax, NS',
    'London, ON',
    'Markham, ON',
    'Vaughan, ON',
    'Gatineau, QC',
    'Longueuil, QC',
    'Burnaby, BC',
    'Saskatoon, SK',
    'Kitchener, ON',
    'Windsor, ON',
    'Regina, SK',
    'Richmond, BC',
    'Richmond Hill, ON',
    'Oakville, ON',
    'Burlington, ON',
    'Sherbrooke, QC',
    'Oshawa, ON',
    'Saguenay, QC',
    'Lévis, QC',
    'Barrie, ON',
    'Abbotsford, BC',
    'St. Catharines, ON',
    'Trois-Rivières, QC',
    'Cambridge, ON',
    'Whitby, ON',
    'Guelph, ON',
    'Kingston, ON',
  ],
  [SupportedCountryCodes.AU]: [
    'Sydney, NSW',
    'Melbourne, VIC',
    'Brisbane, QLD',
    'Perth, WA',
    'Adelaide, SA',
    'Gold Coast, QLD',
    'Canberra, ACT',
    'Newcastle, NSW',
    'Wollongong, NSW',
    'Logan City, QLD',
    'Geelong, VIC',
    'Hobart, TAS',
    'Townsville, QLD',
    'Cairns, QLD',
    'Darwin, NT',
    'Toowoomba, QLD',
    'Ballarat, VIC',
    'Bendigo, VIC',
    'Albury, NSW',
    'Launceston, TAS',
    'Mackay, QLD',
    'Rockhampton, QLD',
    'Bunbury, WA',
    'Bundaberg, QLD',
    'Coffs Harbour, NSW',
    'Wagga Wagga, NSW',
    'Hervey Bay, QLD',
    'Mildura, VIC',
    'Shepparton, VIC',
    'Port Macquarie, NSW',
    'Gladstone, QLD',
    'Tamworth, NSW',
    'Traralgon, VIC',
    'Orange, NSW',
    'Dubbo, NSW',
    'Geraldton, WA',
    'Nowra, NSW',
    'Warrnambool, VIC',
    'Bathurst, NSW',
    'Albany, WA',
  ],
  [SupportedCountryCodes.EU]: [
    // Germany
    'Berlin, DE',
    'Munich, DE',
    // France
    'Paris, FR',
    'Lyon, FR',
    // Italy
    'Rome, IT',
    'Milan, IT',
    // Spain
    'Madrid, ES',
    'Barcelona, ES',
    // Netherlands
    'Amsterdam, NL',
    'Rotterdam, NL',
    // Poland
    'Warsaw, PL',
    'Krakow, PL',
    // Belgium
    'Brussels, BE',
    'Antwerp, BE',
    // Austria
    'Vienna, AT',
    'Graz, AT',
    // Portugal
    'Lisbon, PT',
    'Porto, PT',
    // Czech Republic
    'Prague, CZ',
    'Brno, CZ',
    // Hungary
    'Budapest, HU',
    'Debrecen, HU',
    // Romania
    'Bucharest, RO',
    'Cluj-Napoca, RO',
    // Sweden
    'Stockholm, SE',
    'Gothenburg, SE',
    // Denmark
    'Copenhagen, DK',
    'Aarhus, DK',
    // Finland
    'Helsinki, FI',
    'Tampere, FI',
    // Ireland
    'Dublin, IE',
    'Cork, IE',
    // Greece
    'Athens, GR',
    'Thessaloniki, GR',
    // Croatia
    'Zagreb, HR',
    'Split, HR',
    // Slovenia
    'Ljubljana, SI',
    // Slovakia
    'Bratislava, SK',
    // Bulgaria
    'Sofia, BG',
    'Plovdiv, BG',
    // Lithuania
    'Vilnius, LT',
    'Kaunas, LT',
    // Latvia
    'Riga, LV',
    // Estonia
    'Tallinn, EE',
    // Luxembourg
    'Luxembourg City, LU',
    // Malta
    'Valletta, MT',
    // Cyprus
    'Nicosia, CY',
  ],
}

export interface MockRecentSignatory {
  locale: string
  datetimeSigned: string
}

function generateMockRecentSignatories(
  count: number,
  countryCode: SupportedCountryCodes,
): MockRecentSignatory[] {
  const cities =
    MOCK_CITIES_BY_COUNTRY[countryCode] || MOCK_CITIES_BY_COUNTRY[SupportedCountryCodes.US]
  const signatories: MockRecentSignatory[] = []

  for (let i = 0; i < count; i++) {
    // Generate random time in the last 30 days
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const randomTime = new Date(
      thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()),
    )

    // Pick a random city
    const randomCity = cities[Math.floor(Math.random() * cities.length)]

    signatories.push({
      locale: randomCity,
      datetimeSigned: randomTime.toISOString(),
    })
  }

  // Sort by most recent first
  return signatories.sort(
    (a, b) => new Date(b.datetimeSigned).getTime() - new Date(a.datetimeSigned).getTime(),
  )
}

export const useMockedPetitionData = ({
  countryCode,
  mockRecentSignatoriesCount,
}: {
  countryCode: SupportedCountryCodes
  mockRecentSignatoriesCount: number
}) => {
  const [mockRecentSignatories, setMockRecentSignatories] = useState<MockRecentSignatory[]>([])

  useEffect(() => {
    setMockRecentSignatories(generateMockRecentSignatories(mockRecentSignatoriesCount, countryCode))
  }, [mockRecentSignatoriesCount, countryCode])

  return useMemo(() => mockRecentSignatories, [mockRecentSignatories])
}
