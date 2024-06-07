import { differenceInDays, differenceInHours, differenceInMinutes, format } from 'date-fns'
import path from 'path'
import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { fetchReq } from '@/utils/shared/fetchReq'

const GITHUB_API_URL = 'https://api.github.com/graphql'

interface GithubProjectDataResponse {
  data: {
    repository: {
      issues: {
        nodes: Array<{
          state: string
          url: string
          updatedAt: string
          closedAt: string
          createdAt: string
          assignees: {
            nodes: {
              name: string
              login: string
            }[]
          }
          title: string
          projectItems?: {
            nodes?: [
              {
                effort?: {
                  value: string
                }
                impact?: {
                  value: string
                }
                issueType?: {
                  value: string
                }
              },
            ]
          }
        }>
      }
    }
  }
}

type GithubProjectDataIssues = GithubProjectDataResponse['data']['repository']['issues']['nodes']

export const GITHUB_PROJECT_DATA_QUERY = /* GraphQL */ `
  query ($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      issues(first: 100, after: null) {
        nodes {
          title
          state
          url
          updatedAt
          closedAt
          createdAt
          assignees(first: 5, last: null) {
            nodes {
              name
              login
            }
          }
          projectItems(first: 100) {
            nodes {
              effort: fieldValueByName(name: "Effort") {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  value: name
                }
              }
              impact: fieldValueByName(name: "Impact") {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  value: name
                }
              }
              issueType: fieldValueByName(name: "Issue Type") {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  value: name
                }
              }
            }
          }
        }
      }
    }
  }
`

async function generateProjectData() {
  const variables = {
    owner: 'Stand-With-Crypto',
    name: 'swc-web',
  }

  const response = await fetchReq(GITHUB_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN ?? ''}`,
    },
    body: JSON.stringify({
      query: GITHUB_PROJECT_DATA_QUERY,
      variables,
    }),
  })

  const { data } = (await response.json()) as GithubProjectDataResponse
  const repository = data.repository
  const issues = repository.issues.nodes

  await generateProjectDataOverview(issues)
  await generateProjectDataByAssignee(issues)
}

void runBin(generateProjectData)

async function generateProjectDataOverview(issues: GithubProjectDataIssues) {
  const workbook = xlsx.utils.book_new()

  const closedIssues = issues.filter(issue => issue.state === 'CLOSED')
  const closedIssuesByMonth = closedIssues.reduce(
    (acc, issue) => {
      const closedAtKey = format(new Date(issue.closedAt), 'yyyy-MM (MMMM)')

      if (!acc[closedAtKey]) {
        acc[closedAtKey] = []
      }

      acc[closedAtKey].push(issue)

      return acc
    },
    {} as Record<string, GithubProjectDataIssues>,
  )
  const closedIssuesByMonthOrderedDesc = Object.entries(closedIssuesByMonth).sort(([a], [b]) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  closedIssuesByMonthOrderedDesc.forEach(([month, _issues]) => {
    const worksheet = xlsx.utils.json_to_sheet(
      _issues.map((item: GithubProjectDataIssues[0]) => {
        const days = differenceInDays(new Date(item.closedAt), new Date(item.createdAt))
        const hours = differenceInHours(new Date(item.closedAt), new Date(item.createdAt)) % 24
        const minutes = differenceInMinutes(new Date(item.closedAt), new Date(item.createdAt)) % 60

        const timePassed = []
        if (days > 0) timePassed.push(`${days} days`)
        if (hours > 0) timePassed.push(`${hours} hours`)
        if (minutes > 0) timePassed.push(`${minutes} minutes`)

        return {
          ['Issue Title']: item.title,
          ['Assignee']: item.assignees.nodes[0]?.name ?? item.assignees.nodes[0]?.login ?? '---',
          ['Effort']: item?.projectItems?.nodes?.[0]?.effort?.value ?? '---',
          ['Impact']: item?.projectItems?.nodes?.[0]?.impact?.value ?? '---',
          ['Issue Type']: item?.projectItems?.nodes?.[0]?.issueType?.value ?? '---',
          ['Url']: item.url,
          ['Created']: format(new Date(item.createdAt), 'yyyy-MM-dd'),
          ['Closed']: format(new Date(item.closedAt), 'yyyy-MM-dd'),
          ['Time to Close']: timePassed.join(', '),
          state: item.state === 'CLOSED' ? 'Closed' : 'Open',
        }
      }),
    )

    xlsx.utils.book_append_sheet(workbook, worksheet, month)
  })

  await xlsx.writeFile(workbook, path.join(__dirname, 'projectReportByMonth.xlsx'))
}

async function generateProjectDataByAssignee(issues: GithubProjectDataIssues) {
  const workbook = xlsx.utils.book_new()

  const closedIssues = issues.filter(issue => issue.state === 'CLOSED')

  const issuesByAssignee = closedIssues.reduce(
    (acc, issue) => {
      const assignee = issue.assignees.nodes[0]
      if (!assignee) return acc

      if (!acc[assignee.login]) {
        acc[assignee.login] = []
      }

      acc[assignee.login].push(issue)

      return acc
    },
    {} as Record<string, GithubProjectDataResponse['data']['repository']['issues']['nodes']>,
  )

  Object.entries(issuesByAssignee).forEach(([assignee, _issues]) => {
    const issuesOrderedDesc = _issues.sort((a, b) => {
      return new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()
    })

    const worksheet = xlsx.utils.json_to_sheet(
      issuesOrderedDesc.map((item: GithubProjectDataIssues[0]) => {
        const days = differenceInDays(new Date(item.closedAt), new Date(item.createdAt))
        const hours = differenceInHours(new Date(item.closedAt), new Date(item.createdAt)) % 24
        const minutes = differenceInMinutes(new Date(item.closedAt), new Date(item.createdAt)) % 60

        const timePassed = []
        if (days > 0) timePassed.push(`${days} days`)
        if (hours > 0) timePassed.push(`${hours} hours`)
        if (minutes > 0) timePassed.push(`${minutes} minutes`)

        return {
          ['Issue Title']: item.title,
          ['Assignee']: item.assignees.nodes[0]?.name ?? item.assignees.nodes[0]?.login ?? '---',
          ['Effort']: item?.projectItems?.nodes?.[0]?.effort?.value ?? '---',
          ['Impact']: item?.projectItems?.nodes?.[0]?.impact?.value ?? '---',
          ['Issue Type']: item?.projectItems?.nodes?.[0]?.issueType?.value ?? '---',
          ['Url']: item.url,
          ['Created']: format(new Date(item.createdAt), 'yyyy-MM-dd'),
          ['Closed']: format(new Date(item.closedAt), 'yyyy-MM-dd'),
          ['Time to Close']: timePassed.join(', '),
          state: item.state === 'CLOSED' ? 'Closed' : 'Open',
        }
      }),
    )

    xlsx.utils.book_append_sheet(workbook, worksheet, assignee)
  })

  await xlsx.writeFile(workbook, path.join(__dirname, 'projectReportByAssignee.xlsx'))
}
