import * as Sentry from '@sentry/node'
import { DTSIPersonByElectoralZone } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'
import {
  fetchQuorumByPersonId,
  fetchQuorumByRegionRepresented,
  NormalizedQuorumPolitician,
} from '@/utils/server/quorum/utils/fetchQuorum'
import { matchQuorumPoliticianWithDTSIPerson } from '@/utils/server/quorum/utils/matchQuorumPoliticianWithDTSIPerson'
import { getLogger } from '@/utils/shared/logger'
import { getAUStateNameFromStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { getCAProvinceOrTerritoryNameFromCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { redis } from '@/utils/server/redis'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

const REDIS_QUORUM_POLITICIAN_CACHE_KEY = 'quorum:politician'

const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'

const QUORUM_POLITICIAN_CACHE_TTL = isProd ? SECONDS_DURATION.HOUR : SECONDS_DURATION['2_MINUTES']

const logger = getLogger('getQuorumPoliticianByElectoralZone')

function createQuorumPoliticianMatcher({
  countryCode,
  person,
}: {
  countryCode: SupportedCountryCodes
  person: DTSIPersonByElectoralZone
}) {
  return async (
    getPoliticiansRequestParam: Omit<
      Parameters<typeof fetchQuorumByRegionRepresented>[0],
      'countryCode'
    >,
  ) => {
    logger.info(`Fetching ${getPoliticiansRequestParam.regionRepresented}`)

    const politicians = await fetchQuorumByRegionRepresented({
      ...getPoliticiansRequestParam,
      countryCode,
    })

    if (!politicians) {
      return
    }

    logger.info(`Found ${politicians.length} politicians`)

    return matchQuorumPoliticianWithDTSIPerson(politicians, person)
  }
}

export async function getQuorumPoliticianByDTSIPerson({
  countryCode,
  person,
}: {
  countryCode: SupportedCountryCodes
  person: DTSIPersonByElectoralZone
}) {
  const redisKey = `${REDIS_QUORUM_POLITICIAN_CACHE_KEY}:${person.slug}`

  const cachedPolitician = await redis.get<NormalizedQuorumPolitician>(redisKey)
  if (cachedPolitician) {
    logger.info(`Found cached politician for ${person.slug}`)
    return cachedPolitician
  }

  const manualMapping = DTSI_SLUG_TO_QUORUM_ID_MAPPING[person.slug]

  let match: NormalizedQuorumPolitician | null | undefined = null

  if (manualMapping) {
    logger.info(`Found manual match for ${person.slug}`)

    match = await fetchQuorumByPersonId(manualMapping)
  }

  const quorumPoliticianMatcher = createQuorumPoliticianMatcher({
    countryCode,
    person,
  })

  const stateCode = person.primaryRole?.primaryState

  let electoralZone = person.primaryRole?.primaryDistrict

  if (countryCode === SupportedCountryCodes.US) {
    // TODO: Change this once the Quorum API is fixed
    electoralZone = `${stateCode}-${
      electoralZone === 'At-Large' ? '1' : electoralZone
    }`.toUpperCase()
  } else {
    electoralZone = convertDTSIElectoralZoneToQuorumElectoralZone(electoralZone, countryCode)
  }

  if (!match && electoralZone) {
    match = await quorumPoliticianMatcher({
      regionRepresented: electoralZone,
    })
  }

  if (!match) {
    if (countryCode === SupportedCountryCodes.AU && stateCode) {
      const stateName = getAUStateNameFromStateCode(stateCode)

      if (electoralZone) {
        match = await quorumPoliticianMatcher({
          regionRepresented: `${electoralZone}, ${stateName}`,
        })

        if (!match) {
          match = await quorumPoliticianMatcher({
            regionRepresented: `${electoralZone}, ${stateCode}`,
          })
        }
      }

      if (!match) {
        match = await quorumPoliticianMatcher({
          regionRepresented: stateName,
          limit: 100,
        })
      }
    }

    if (countryCode === SupportedCountryCodes.CA) {
      if (electoralZone && electoralZone.includes('-')) {
        match = await quorumPoliticianMatcher({
          regionRepresented: electoralZone.replace(/-/g, '—'),
        })
      }

      if (!match && stateCode) {
        const stateName = getCAProvinceOrTerritoryNameFromCode(stateCode)

        match = await quorumPoliticianMatcher({
          regionRepresented: stateName,
          limit: 100,
        })
      }
    }
  }

  if (!match) {
    Sentry.captureMessage(`No match found for ${person.slug}`, {
      level: 'error',
      tags: {
        domain: 'quorum',
        countryCode,
      },
      extra: {
        ...person,
        electoralZone,
      },
    })
  }

  if (match) {
    await redis.set(redisKey, match, {
      ex: QUORUM_POLITICIAN_CACHE_TTL,
    })
    logger.info(`Set cached Quorum politician for ${person.slug}`)
  }

  return match
}

const DTSI_SLUG_TO_QUORUM_ID_MAPPING: Record<string, string> = {
  'keir---starmer---gb': '1278291',
  'alistair---carns---gb': '3755978',
  'angela---rayner---gb': '1277822',
  'mark---carney---ca': '3991638',
  'jennifer---oconnell---ca': '1266150',
  'andrew---leigh---au': '1268676',
  'steve---georganas---au': '1263713',
  'ged---kearney---au': '1263729',
  'jodie---belyea---au': '3589113',
  'chris---bowen---au': '1263685',
  'simon---kennedy---au': '3625152',
  'michelle---rowland---au': '1263792',
  'justine---elliot---au': '3549880',
  'andrew---wilkie---au': '1263761',
}

const ELECTORAL_ZONE_MAPPING: Record<SupportedCountryCodes, Record<string, string>> = {
  [SupportedCountryCodes.CA]: {
    [`South Shore-St Margaret's`]: 'South Shore-St. Margarets',
    'Becancour-Nicolet-Saurel-Alnobak': 'Bécancour—Nicolet—Saurel—Alnôbak',
    'Niagara Falls-Niagara-on-the-Lake': 'Niagara Falls—Niagara-on-the-Lake',
    'Toronto-St': `Toronto—St. Paul's`,
    'Ville-Marie-Le-Sud-Ouest-Ile-Des-Soeurs': 'Ville-Marie—Le Sud-Ouest—Île-des-Soeurs',
    'Gaspesie-Les Iles-de-la-Madeleine-Listuguj': 'Gaspésie-Les Îles-de-la-Madeleine',
    'Portneuf-Jacques-Cartier': 'Portneuf—Jacques-Cartier',
    'Saint-Hyacinthe-Bagot-Acton': 'Saint-Hyacinthe—Bagot—Acton',
    'Laval-Les Iles': 'Laval-Les Îles',
    'Barrie-Springwater-Oro Medonte': 'Barrie-Springwater-Oro-Medonte',
    'Leeds-Grenville-Thousand Islands-Rideau Lakes':
      'Leeds-Grenville-Thousand Islands and Rideau Lakes',
    'Richmond Hill South': 'Richmond Hill',
    'Niagara South': 'Niagara Centre',
    Peterborough: 'Peterborough-Kawartha',
    'Richmond Centre-Marpole': 'Richmond Centre',
    'Winnipeg West': 'Charleswood-St. James-Assiniboia-Headingley',
    Kelowna: 'Kelowna-Lake Country',
    [`Mont-Saint-Bruno-L'Acadie`]: 'Montarville',
    'Spadina-Harbourfront': 'Spadina-Fort York',
    'Montmorency-Charlevoix': `Beauport-Côte-de-Beaupré-Île d'Orléans-Charlevoix`,
    'Chateauguay-Les Jardins-de-Napierville': 'Châteauguay-Lacolle',
    [`Taiaiako'n-Parkdale-High Park`]: 'Parkdale—High Park',
    'Prescott-Russell-Cumberland': 'Glengarry-Prescott-Russell',
    'Hochelaga-Rosemont-Est': 'Hochelaga',
    'Sudbury East-Manitoulin-Nickel Belt': 'Nickel Belt',
    'Milton East-Halton Hills South': 'Milton',
    'La Prairie-Atateken': 'La Prairie',
    'Windsor-Tecumseh-Lakeshore': 'Windsor-Tecumseh',
    'Charlesbourg-Haute-Saint-Charles': 'Charlesbourg—Haute-Saint-Charles',
    Beausejour: 'Beauséjour',
    'Chatham-Kent-Leamington': 'Chatham-Kent—Leamington',
    'Pierre-Boucher-Les Patriotes-Vercheres': 'Pierre-Boucher-Les Patriotes-Verchères',
    [`St John's East`]: `St. John's East`,
    Orleans: 'Orléans',
    'St Catherines': 'St. Catharines',
    'Sault Ste': 'Sault Ste. Marie-Algoma',
    [`La Pointe-de-L'Ile`]: `La Pointe-de-l'Île`,
    'Desnethe-Missinippi-Churchill River': 'Desnethé-Missinippi-Churchill River',
    'Louis-Saint-Laurent-Akiawenhrahk': 'Louis-Saint-Laurent—Akiawenhrahk',
    Jonquiere: 'Jonquière',
    'Quebec Centre': 'Québec Centre',
    'Berthier-Maskinonge': 'Berthier-Maskinongé',
    'Louis-Hebert': 'Louis-Hébert',
    'Levis-Lotbiniere': 'Lévis-Lotbinière',
    'Riviere-des-Mille-Iles': 'Rivière-des-Mille-Îles',
    'Surrey Newton': 'Surrey-Newton',
    'Sarnia-Lambton-Bkejwanong': 'Sarnia-Lambton',
    'Trois-Rivieres': 'Trois-Rivières',
    'Kildonan-St Paul': 'Kildonan-St. Paul',
    'Bellechasse-Les Etchemins-Levis': 'Bellechasse-Les Etchemins-Lévis',
    'Riviere-du-Nord': 'Rivière-du-Nord',
    [`Megantic-L'Erable-Lotbiniere`]: `Mégantic—L'Érable—Lotbinière`,
    'New Westminster-Burnaby-Maillardville': 'New Westminster-Burnaby',
    'Cote-du-Sud-Riviere-du-Loup-Kataskomiq-Temsicouata':
      'Côte-du-Sud-Rivière-du-Loup-Kataskomiq-Témiscouata',
    'York South-Weston-Etobicoke': 'York South-Weston',
    'Therese-De Blainville': 'Thérèse-De Blainville',
    'Marc-Aurele-Fortin': 'Marc-Aurèle-Fortin',
    'Saint-Leonard-Saint-Michel': 'Saint-Léonard-Saint-Michel',
    'St Albert-Sturgeon River': 'St. Albert—Sturgeon River',
  },
  [SupportedCountryCodes.AU]: {
    [`O'Connor`]: `O'Connor, Western Australia, Katanning`,
  },
  [SupportedCountryCodes.GB]: {
    'Montgomeryshire and Glyndwr': 'Montgomeryshire and Glyndŵr',
  },
  [SupportedCountryCodes.US]: {},
}

function convertDTSIElectoralZoneToQuorumElectoralZone(
  dtsiElectoralZone: string | undefined,
  countryCode: SupportedCountryCodes,
) {
  if (!dtsiElectoralZone) {
    return
  }

  return ELECTORAL_ZONE_MAPPING[countryCode][dtsiElectoralZone] || dtsiElectoralZone
}
