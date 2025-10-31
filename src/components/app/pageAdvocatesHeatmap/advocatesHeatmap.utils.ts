import {
  AdvocateHeatmapAction,
  AreaCoordinatesKey,
  Coords,
} from '@/components/app/pageAdvocatesHeatmap/constants'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { UserActionType } from '@prisma/client'

type ActivityWithLocation = PublicRecentActivity['data'][number] & {
  administrativeArea: AreaCoordinatesKey
  coordinates?: Coords
}

const MAX_MARKERS_PER_ADMINISTRATIVE_AREA = 3

/**
 * Generates a unique ID for a marker based on country code and administrative area
 */
function generateMarkerUniqueId(
  countryCode: SupportedCountryCodes,
  administrativeArea: AreaCoordinatesKey,
) {
  return `${countryCode}:${administrativeArea}`
}

/**
 * Simple hash function to convert string to number
 * Based on Java's String.hashCode()
 */
function hashString(string: string): number {
  let hash = 0
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Seeded random number generator
 * Returns a deterministic value between 0 and 1 based on seed
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10_000
  return x - Math.floor(x)
}

/**
 * Generates a deterministic triangular offset based on a seed
 * Triangular distribution concentrates values near the center, reducing the likelihood of markers appearing at the edges
 * @param maxRange Maximum absolute deviation from center
 * @param seed Seed for deterministic randomness
 * @returns Consistent triangular random value
 */
function getSeededTriangularOffset(maxRange: number, seed: number): number {
  const u1 = seededRandom(seed)
  const u2 = seededRandom(seed + 1) // Offset seed slightly for second value
  return (u1 + u2 - 1) * maxRange
}

/**
 * Distributes 3 markers in a triangular pattern around a central point with deterministic triangular jitter to avoid overlap
 * Each state/area gets a unique triangle rotation for more natural appearance
 * Markers are positioned 120° apart in an equilateral triangle pattern, then small jitter is applied for natural appearance.
 * The positions will remain consistent across reloads for the same inputs.
 * @param params Configuration object with center coordinates, spacing, and jitter ranges
 * @returns Array of 3 non-overlapping jittered coordinate pairs
 */
function generateJitteredMarkerPositions({
  centerCoordinates,
  horizontalRange = 0.1,
  uniqueId,
  verticalRange = 0.3,
  verticalSpacing,
}: {
  centerCoordinates: Coords
  horizontalRange?: number
  uniqueId: string
  verticalRange?: number
  verticalSpacing: number
}): [Coords, Coords, Coords] {
  const baseSeed = hashString(uniqueId)

  // Generate a unique rotation angle for this state (0° to 360°)
  const rotationAngle = seededRandom(baseSeed) * 2 * Math.PI

  // Base positions in equilateral triangle pattern (120° apart)
  const basePositions = [
    { angle: rotationAngle, radius: 0.6 }, // Marker 1
    { angle: rotationAngle + (2 * Math.PI) / 3, radius: 0.6 }, // Marker 2 (+120°)
    { angle: rotationAngle + (4 * Math.PI) / 3, radius: 0.6 }, // Marker 3 (+240°)
  ]

  return basePositions.map((pos, index) => {
    // Calculate base position in triangular pattern
    const baseX = Math.cos(pos.angle) * pos.radius * verticalSpacing
    const baseY = Math.sin(pos.angle) * pos.radius * verticalSpacing

    // Add small triangular jitter for natural appearance
    const lonSeed = baseSeed + index * 100
    const latSeed = baseSeed + index * 100 + 50

    const jitterX = getSeededTriangularOffset(horizontalRange, lonSeed)
    const jitterY = getSeededTriangularOffset(verticalRange, latSeed)

    return applyCoordinatesOffset(centerCoordinates, baseX + jitterX, baseY + jitterY)
  }) as [Coords, Coords, Coords]
}

export function applyCoordinatesOffset(
  coordinates: Coords,
  offsetX: number,
  offsetY: number,
): Coords {
  return [coordinates[0] + offsetX, coordinates[1] + offsetY]
}

export function getMarkerPositions({
  administrativeArea,
  coordinates,
  countryCode,
  offset,
  shouldRandomizeMarkerOffsets = false,
}: {
  administrativeArea: AreaCoordinatesKey
  coordinates: Coords
  countryCode: SupportedCountryCodes
  offset: number
  shouldRandomizeMarkerOffsets?: boolean
}): [Coords, Coords, Coords] {
  if (shouldRandomizeMarkerOffsets) {
    const uniqueId = generateMarkerUniqueId(countryCode, administrativeArea)
    return generateJitteredMarkerPositions({
      centerCoordinates: coordinates,
      uniqueId,
      verticalSpacing: offset,
    })
  }

  return [
    applyCoordinatesOffset(coordinates, 0, 0),
    applyCoordinatesOffset(coordinates, -offset, offset),
    applyCoordinatesOffset(coordinates, offset, -offset),
  ]
}

/**
 * Calculates a single marker position with deterministic triangular jitter.
 * Used for real actions where each action gets its own unique position.
 * @param params Configuration object for marker positioning
 * @returns Single jittered coordinate pair
 */
export function getJitteredMarkerPosition({
  administrativeArea,
  centerCoordinates,
  countryCode,
  horizontalRange = 0.1,
  markerIndexInArea,
  verticalRange = 0.3,
  verticalSpacing,
}: {
  administrativeArea: AreaCoordinatesKey
  centerCoordinates: Coords
  countryCode: SupportedCountryCodes
  horizontalRange?: number
  markerIndexInArea: number
  verticalRange?: number
  verticalSpacing: number
}): Coords {
  const uniqueId = generateMarkerUniqueId(countryCode, administrativeArea)
  const baseSeed = hashString(uniqueId)

  // Generate a unique rotation angle for this area (0° to 360°)
  const rotationAngle = seededRandom(baseSeed) * 2 * Math.PI

  // Position in triangular pattern based on marker index
  // Distribute markers in a circle with triangular spacing
  const angleOffset = (markerIndexInArea * (2 * Math.PI)) / 3 // 120° apart
  const angle = rotationAngle + angleOffset
  const radius = 0.6

  // Calculate base position in triangular pattern
  const baseX = Math.cos(angle) * radius * verticalSpacing
  const baseY = Math.sin(angle) * radius * verticalSpacing

  // Add triangular jitter for natural appearance (different for each marker)
  const lonSeed = baseSeed + markerIndexInArea * 100
  const latSeed = baseSeed + markerIndexInArea * 100 + 50

  const jitterX = getSeededTriangularOffset(horizontalRange, lonSeed)
  const jitterY = getSeededTriangularOffset(verticalRange, latSeed)

  return applyCoordinatesOffset(centerCoordinates, baseX + jitterX, baseY + jitterY)
}

export function getAdministrativeAreaFromActivity(
  item: PublicRecentActivity['data'][number],
): AreaCoordinatesKey {
  const userLocation = item.user.userLocationDetails
  const { administrativeAreaLevel1, swcCivicAdministrativeArea } = userLocation ?? {}
  return (swcCivicAdministrativeArea ?? administrativeAreaLevel1) as AreaCoordinatesKey
}

export function getCoordinatesForArea(
  administrativeArea: AreaCoordinatesKey,
  stateCoords: Partial<Record<string, Coords>>,
): Coords | undefined {
  return stateCoords[administrativeArea as string]
}

export function isValidActivityItem(
  item: ActivityWithLocation,
  index: number,
  items: ActivityWithLocation[],
  actions: Partial<Record<UserActionType, AdvocateHeatmapAction>>,
): item is ActivityWithLocation & { coordinates: Coords } {
  const hasValidData = Boolean(item.administrativeArea) && Boolean(item.coordinates)
  const hasActionConfig = Boolean(actions[item.actionType])

  const markersInSameArea = items
    .slice(0, index)
    .filter(({ administrativeArea }) => administrativeArea === item.administrativeArea).length
  const isWithinLimit = markersInSameArea < MAX_MARKERS_PER_ADMINISTRATIVE_AREA

  return hasValidData && hasActionConfig && isWithinLimit
}
