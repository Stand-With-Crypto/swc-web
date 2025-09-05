import { runBin } from '@/bin/runBin'
import { getTotalAdvocatesByState } from '@/data/aggregations/getTotalAdvocatesPerState'
import { prismaClient } from '@/utils/server/prismaClient'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/stateMappings/usStateDistrictUtils'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'

// Original query with EXPLAIN
async function getTotalAdvocatesPerStateExplain() {
  const results = await prismaClient.$queryRaw`
    EXPLAIN
    SELECT
      address.administrative_area_level_1 AS state,
      COUNT(user.id) AS totalAdvocates
    FROM address
    JOIN user ON user.address_id = address.id
    WHERE address.administrative_area_level_1 != ''
    AND address.country_code = 'US'
    GROUP BY address.administrative_area_level_1;
  `
  return results
}

// Original query with EXPLAIN ANALYZE
async function getTotalAdvocatesPerStateExplainAnalyze() {
  const results = await prismaClient.$queryRaw`
    EXPLAIN ANALYZE
    SELECT
      address.administrative_area_level_1 AS state,
      COUNT(user.id) AS totalAdvocates
    FROM address
    JOIN user ON user.address_id = address.id
    WHERE address.administrative_area_level_1 != ''
    AND address.country_code = 'US'
    GROUP BY address.administrative_area_level_1;
  `
  return results
}

async function benchmarkAdvocatesPerState() {
  console.log('--- Running EXPLAIN for getTotalAdvocatesPerState ---')
  const explainResult = await getTotalAdvocatesPerStateExplain()
  console.log(explainResult)

  console.log('\n--- Running EXPLAIN ANALYZE for getTotalAdvocatesPerState ---')
  const explainAnalyzeResult = await getTotalAdvocatesPerStateExplainAnalyze()
  console.log(explainAnalyzeResult)
}

// New query with EXPLAIN
async function getTotalAdvocatesByStateExplain(stateCode: USStateCode) {
  return prismaClient.$queryRaw`
    EXPLAIN
    SELECT
      address.administrative_area_level_1 AS state,
      COUNT(user.id) AS totalAdvocates
    FROM address
    JOIN user ON user.address_id = address.id
    WHERE address.administrative_area_level_1 = ${stateCode}
    AND address.country_code = 'US'
    GROUP BY address.administrative_area_level_1;
  `
}

// New query with EXPLAIN ANALYZE
async function getTotalAdvocatesByStateExplainAnalyze(stateCode: USStateCode) {
  return prismaClient.$queryRaw`
    EXPLAIN ANALYZE
    SELECT
      address.administrative_area_level_1 AS state,
      COUNT(user.id) AS totalAdvocates
    FROM address
    JOIN user ON user.address_id = address.id
    WHERE address.administrative_area_level_1 = ${stateCode}
    AND address.country_code = 'US'
    GROUP BY address.administrative_area_level_1;
  `
}

async function queryStatePerformance(stateCode: USStateCode): Promise<{
  state: USStateCode
  duration: number
  result: Awaited<ReturnType<typeof getTotalAdvocatesByState>>
}> {
  const start = performance.now()
  const result = await getTotalAdvocatesByState(stateCode)
  const end = performance.now()
  return { state: stateCode, duration: end - start, result }
}

async function benchmarkAdvocatesByState() {
  const stateCodes = Object.keys(US_STATE_CODE_TO_DISTRICT_COUNT_MAP) as USStateCode[]
  const statePromises = stateCodes.map(queryStatePerformance)

  console.log(`\n--- Benchmarking getTotalAdvocatesByState (State-by-State) ---`)
  console.log(`Starting parallel benchmark for ${stateCodes.length} states...`)
  const totalBenchmarkStart = performance.now()

  const results = await Promise.allSettled(statePromises)

  const totalBenchmarkEnd = performance.now()
  const totalWallClockTime = totalBenchmarkEnd - totalBenchmarkStart

  const successfulTimings: { state: string; duration: number }[] = []
  let failedCount = 0

  console.log('\n--- Individual State Timings ---')
  results.forEach((result, index) => {
    const stateCode = stateCodes[index]
    if (result.status === 'fulfilled') {
      successfulTimings.push(result.value)
      console.log(`  ${result.value.state}: ${result.value.duration.toFixed(2)}ms`)
    } else {
      failedCount++
      console.error(`  ${stateCode}: FAILED - ${result.reason}`)
    }
  })

  const sumOfDurations = successfulTimings.reduce((sum, t) => sum + t.duration, 0)
  const average = sumOfDurations / successfulTimings.length || 0
  const min = Math.min(...successfulTimings.map(t => t.duration))
  const max = Math.max(...successfulTimings.map(t => t.duration))

  console.log(`\n--- Benchmark Summary (Parallel Execution) ---`)
  console.log(`Total states attempted: ${stateCodes.length}`)
  console.log(`Successful queries: ${successfulTimings.length}`)
  console.log(`Failed queries: ${failedCount}`)
  console.log(
    `Total wall-clock time: ${totalWallClockTime.toFixed(2)}ms (for all parallel queries)`,
  )
  console.log(
    `Average time per successful state query: ${average.toFixed(2)}ms (individual query duration)`,
  )
  if (successfulTimings.length > 0) {
    console.log(`Min individual query time: ${min.toFixed(2)}ms`)
    console.log(`Max individual query time: ${max.toFixed(2)}ms`)
  }
}

async function main() {
  await benchmarkAdvocatesPerState()

  console.log(`\n--- Running EXPLAIN for getTotalAdvocatesByState (CA) ---`)
  const byStateExplain = await getTotalAdvocatesByStateExplain('CA')
  console.log(byStateExplain)

  console.log(`\n--- Running EXPLAIN ANALYZE for getTotalAdvocatesByState (CA) ---`)
  const byStateExplainAnalyze = await getTotalAdvocatesByStateExplainAnalyze('CA')
  console.log(byStateExplainAnalyze)

  await benchmarkAdvocatesByState()
}

void runBin(main)
