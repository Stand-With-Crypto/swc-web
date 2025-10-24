/**
 * Generate PR Count Report by Contributor
 *
 * This script generates a report showing the total number of pull requests
 * created by each contributor over a specified number of days.
 *
 * Usage:
 *   npm run ts src/bin/reports/generatePRCountByContributor.ts -- --days <number>
 *
 * Examples:
 *   npm run ts src/bin/reports/generatePRCountByContributor.ts -- --days 7
 *   npm run ts src/bin/reports/generatePRCountByContributor.ts -- --days 30
 *   npm run ts src/bin/reports/generatePRCountByContributor.ts -- --days 90
 *
 * Output:
 *   - Console summary with top contributors
 *   - Excel file saved to ./src/bin/localCache/prCountByContributor-{days}days.xlsx
 *   - Excel contains two sheets: Summary (counts by contributor) and All PRs (detailed list)
 */

import { format, subDays } from 'date-fns'
import xlsx from 'xlsx'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { runBin } from '@/bin/runBin'
import { fetchReq } from '@/utils/shared/fetchReq'

const GITHUB_API_URL = 'https://api.github.com/graphql'

const params = yargs(hideBin(process.argv)).option('days', {
  type: 'number',
  demandOption: true,
  description: 'Number of days to look back for PR data',
})

interface PullRequest {
  title: string
  url: string
  createdAt: string
  mergedAt: string | null
  state: string
  author: {
    login: string
    name?: string
  } | null
  repository: {
    name: string
  }
  additions: number
  deletions: number
  changedFiles: number
}

interface GithubPRDataResponse {
  data: {
    repository: {
      pullRequests: {
        nodes: Array<PullRequest>
        pageInfo: {
          hasNextPage: boolean
          endCursor?: string
        }
      }
    }
  }
}

export const GITHUB_PR_DATA_QUERY = /* GraphQL */ `
  query ($owner: String!, $name: String!, $after: String) {
    repository(owner: $owner, name: $name) {
      pullRequests(first: 100, after: $after, orderBy: { field: CREATED_AT, direction: DESC }) {
        nodes {
          title
          url
          createdAt
          mergedAt
          state
          author {
            login
            ... on User {
              name
            }
          }
          repository {
            name
          }
          additions
          deletions
          changedFiles
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`

async function getGithubPRData(
  pullRequests: PullRequest[],
  repositoryName: string,
  sinceDate: string,
  after?: string,
) {
  const response = await fetchReq(GITHUB_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN ?? ''}`,
    },
    body: JSON.stringify({
      query: GITHUB_PR_DATA_QUERY,
      variables: {
        owner: 'Stand-With-Crypto',
        name: repositoryName,
        after,
      },
    }),
  })

  const responseData = (await response.json()) as any

  // Check for GraphQL errors
  if (responseData.errors) {
    console.error('GraphQL errors:', responseData.errors)
    throw new Error(`GraphQL errors: ${JSON.stringify(responseData.errors)}`)
  }

  const { data } = responseData as GithubPRDataResponse

  if (!data || !data.repository) {
    console.error('No repository data found for:', repositoryName)
    console.error('Response:', responseData)
    return
  }

  const repository = data.repository
  const repositoryPRs = repository?.pullRequests

  if (repositoryPRs) {
    // Filter PRs to only include those created within our date range
    const filteredPRs = repositoryPRs.nodes.filter(
      pr => new Date(pr.createdAt) >= new Date(sinceDate),
    )

    pullRequests.push(...filteredPRs)

    // Check if we've reached PRs older than our date range
    const hasOlderPRs = repositoryPRs.nodes.some(pr => new Date(pr.createdAt) < new Date(sinceDate))

    // Continue pagination if there are more pages and we haven't reached PRs older than our date range
    if (repositoryPRs.pageInfo.hasNextPage && !hasOlderPRs) {
      await getGithubPRData(
        pullRequests,
        repositoryName,
        sinceDate,
        repositoryPRs.pageInfo.endCursor,
      )
    }
  }
}

async function generatePRCountByContributor() {
  const { days } = await params.argv
  console.log(`Generating PR count report for the last ${days} days. Please wait...`)

  const endDate = new Date()
  const startDate = subDays(endDate, days)
  const sinceDate = startDate.toISOString()

  const pullRequests: PullRequest[] = []

  // Fetch PRs from both repositories
  await getGithubPRData(pullRequests, 'swc-web', sinceDate)
  await getGithubPRData(pullRequests, 'swc-internal', sinceDate)

  await writePRCountReport(pullRequests, days)

  console.log('Generated PR count report successfully!')
}

void runBin(generatePRCountByContributor)

async function writePRCountReport(pullRequests: PullRequest[], days: number) {
  // Group PRs by contributor
  const prsByContributor = pullRequests.reduce(
    (acc, pr) => {
      const authorLogin = pr.author?.login || 'Unknown'
      const authorName = pr.author?.name || pr.author?.login || 'Unknown'

      if (!acc[authorLogin]) {
        acc[authorLogin] = {
          name: authorName,
          login: authorLogin,
          prs: [],
        }
      }

      acc[authorLogin].prs.push(pr)
      return acc
    },
    {} as Record<string, { name: string; login: string; prs: PullRequest[] }>,
  )

  const workbook = xlsx.utils.book_new()

  // Create summary sheet with counts
  const summaryRows = Object.entries(prsByContributor)
    .map(([login, data]) => ({
      'Contributor Name': data.name,
      'GitHub Login': login,
      'Total PRs': data.prs.length,
      'Merged PRs': data.prs.filter(pr => pr.state === 'MERGED').length,
      'Open PRs': data.prs.filter(pr => pr.state === 'OPEN').length,
      'Closed PRs': data.prs.filter(pr => pr.state === 'CLOSED').length,
      'Total Additions': data.prs.reduce((sum, pr) => sum + pr.additions, 0),
      'Total Deletions': data.prs.reduce((sum, pr) => sum + pr.deletions, 0),
      'Total Changed Files': data.prs.reduce((sum, pr) => sum + pr.changedFiles, 0),
    }))
    .sort((a, b) => b['Total PRs'] - a['Total PRs']) // Sort by PR count descending

  const summaryWorksheet = xlsx.utils.json_to_sheet(summaryRows)
  xlsx.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary')

  // Create detailed sheet with all PRs
  const detailRows = pullRequests
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((pr: PullRequest) => ({
      'PR Title': pr.title,
      'Author Name': pr.author?.name || pr.author?.login || 'Unknown',
      'Author Login': pr.author?.login || 'Unknown',
      Repository: pr.repository.name,
      State: pr.state,
      'Created Date': format(new Date(pr.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      'Merged Date': pr.mergedAt ? format(new Date(pr.mergedAt), 'yyyy-MM-dd HH:mm:ss') : '',
      Additions: pr.additions,
      Deletions: pr.deletions,
      'Changed Files': pr.changedFiles,
      URL: pr.url,
    }))

  const detailWorksheet = xlsx.utils.json_to_sheet(detailRows)
  xlsx.utils.book_append_sheet(workbook, detailWorksheet, 'All PRs')

  await xlsx.writeFile(workbook, `./src/bin/localCache/prCountByContributor-${days}days.xlsx`)

  // Also log summary to console
  console.log('\n=== PR Count Summary ===')
  console.log(
    `Date Range: ${format(subDays(new Date(), days), 'yyyy-MM-dd')} to ${format(new Date(), 'yyyy-MM-dd')}`,
  )
  console.log(`Total PRs: ${pullRequests.length}`)
  console.log('\nTop Contributors:')
  summaryRows.forEach((row, index) => {
    console.log(
      `${index + 1}. ${row['Contributor Name']} (@${row['GitHub Login']}): ${row['Total PRs']} PRs`,
    )
  })
  console.log(`\nFull report saved to: ./src/bin/localCache/prCountByContributor-${days}days.xlsx`)
}
