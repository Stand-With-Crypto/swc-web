import { differenceInDays, differenceInHours, differenceInMinutes, format } from 'date-fns'
import path from 'path'
import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { fetchReq } from '@/utils/shared/fetchReq'

const GITHUB_API_URL = 'https://api.github.com/graphql'

interface GithubProjectDataIssueNode {
  state: string
  stateReason: string
  url: string
  updatedAt: string
  closedAt: string
  createdAt: string
  repository: {
    name: string
  }
  milestone?: {
    title: string
  }
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
        status?: {
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
}
interface GithubProjectDataResponse {
  data: {
    repository: {
      issues?: {
        nodes: Array<GithubProjectDataIssueNode>
        pageInfo: {
          hasNextPage: boolean
          endCursor?: string
        }
      }
    }
  }
}

export const GITHUB_PROJECT_DATA_QUERY = /* GraphQL */ `
  query ($owner: String!, $name: String!, $after: String) {
    repository(owner: $owner, name: $name) {
      issues(first: 100, after: $after) {
        nodes {
          title
          state
          url
          updatedAt
          closedAt
          stateReason
          createdAt
          repository {
            name
          }
          milestone {
            title
          }
          assignees(first: 5, last: null) {
            nodes {
              name
              login
            }
          }
          projectItems(first: 100) {
            nodes {
              status: fieldValueByName(name: "Status") {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  value: name
                }
              }
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
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`

async function getGithubProjectData(
  issues: GithubProjectDataIssueNode[],
  repositoryName: string,
  after?: string,
) {
  const response = await fetchReq(GITHUB_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN ?? ''}`,
    },
    body: JSON.stringify({
      query: GITHUB_PROJECT_DATA_QUERY,
      variables: {
        owner: 'Stand-With-Crypto',
        name: repositoryName,
        after,
      },
    }),
  })

  const { data } = (await response.json()) as GithubProjectDataResponse
  const repository = data.repository
  const repositoryIssues = repository?.issues
  if (repositoryIssues) {
    issues.push(...repositoryIssues.nodes)

    if (repositoryIssues.pageInfo.hasNextPage) {
      await getGithubProjectData(issues, repositoryName, repositoryIssues.pageInfo.endCursor)
    }
  }
}

async function generateProjectData() {
  const issues: GithubProjectDataIssueNode[] = []

  await getGithubProjectData(issues, 'swc-web')
  await getGithubProjectData(issues, 'swc-internal')

  await writeProjectData(issues)
}

void runBin(generateProjectData)

async function writeProjectData(issues: GithubProjectDataIssueNode[]) {
  const workbook = xlsx.utils.book_new()

  const issuesOrderedDesc = issues.sort((a, b) => {
    return new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()
  })

  const worksheet = xlsx.utils.json_to_sheet(
    issuesOrderedDesc.map((item: GithubProjectDataIssueNode) => {
      const days = differenceInDays(new Date(item.closedAt), new Date(item.createdAt))
      const hours = differenceInHours(new Date(item.closedAt), new Date(item.createdAt)) % 24
      const minutes = differenceInMinutes(new Date(item.closedAt), new Date(item.createdAt)) % 60

      const timePassed = []
      if (days > 0) timePassed.push(`${days} days`)
      if (hours > 0) timePassed.push(`${hours} hours`)
      if (minutes > 0) timePassed.push(`${minutes} minutes`)
      return {
        ['Issue Title']: item.title,
        ['Assignee']: item.assignees.nodes[0]?.name ?? item.assignees.nodes[0]?.login,
        ['Effort']: item?.projectItems?.nodes?.[0]?.effort?.value,
        ['Impact']: item?.projectItems?.nodes?.[0]?.impact?.value,
        ['Status']: item?.projectItems?.nodes?.[0]?.status?.value,
        ['Issue Type']: item?.projectItems?.nodes?.[0]?.issueType?.value,
        ['Repo']: item?.repository?.name,
        ['Url']: item.url,
        ['Created']: format(new Date(item.createdAt), 'yyyy-MM-dd'),
        ['Closed']: format(new Date(item.closedAt), 'yyyy-MM-dd'),
        ['Time to Close']: timePassed.join(', '),
        ['Milestone']: item.milestone?.title,
        State:
          item.state === 'CLOSED' && item.stateReason === 'NOT_PLANNED'
            ? 'CLOSED_NOT_PLANNED'
            : item.state,
      }
    }),
  )

  xlsx.utils.book_append_sheet(workbook, worksheet, 'Main')
  await xlsx.writeFile(workbook, './src/bin/localCache/projectReport.xlsx')
}
