import { format, startOfMonth, startOfWeek } from 'date-fns'
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
  labels?: {
    nodes: {
      name: string
    }[]
  }
  projectItems?: {
    nodes?: [
      {
        effortTechnical?: {
          value:
            | '1 - less than a day'
            | '2 - less than 3 days'
            | '3 - less than a week'
            | '4 - less than 2 weeks'
            | '5 - greater than 2 weeks'
        }
        effortNontechnical?: {
          value:
            | '1 - less than a day'
            | '2 - less than 3 days'
            | '3 - less than a week'
            | '4 - less than 2 weeks'
            | '5 - greater than 2 weeks'
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
        longTermEffort?: {
          number: number
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
          labels(first: 10) {
            nodes {
              name
            }
          }
          projectItems(first: 100) {
            nodes {
              status: fieldValueByName(name: "Status") {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  value: name
                }
              }
              effortTechnical: fieldValueByName(name: "Effort - Technical") {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  value: name
                }
              }
              effortNontechnical: fieldValueByName(name: "Effort - Nontechnical") {
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
              longTermEffort: fieldValueByName(name: "Long Term Effort - Weeks") {
                ... on ProjectV2ItemFieldNumberValue {
                  number
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

function getComputedDaysOfEffort(issue: GithubProjectDataIssueNode) {
  const longTermEffort = issue?.projectItems?.nodes?.[0]?.longTermEffort?.number
  const effort = issue?.projectItems?.nodes?.[0]?.effortTechnical?.value
  if (longTermEffort) {
    return longTermEffort * 5
  }
  switch (effort) {
    case '1 - less than a day':
      return 1
    case '2 - less than 3 days':
      return 3
    case '3 - less than a week':
      return 5
    case '4 - less than 2 weeks':
      return 10
    case '5 - greater than 2 weeks':
      throw new Error(
        `getComputedDaysOfEffort expected a Long Term Effort for effort sizing of 5: ${issue.url}`,
      )
  }
}

async function writeProjectData(issues: GithubProjectDataIssueNode[]) {
  const workbook = xlsx.utils.book_new()

  const issuesOrderedDesc = issues.sort((a, b) => {
    return new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()
  })
  const rows = issuesOrderedDesc.flatMap((item: GithubProjectDataIssueNode) => {
    return (item.assignees.nodes.length ? item.assignees.nodes : [null]).map(assignee => {
      return {
        ['Issue Title']: item.title,
        ['Assignee']: assignee?.name ?? assignee?.login,
        ['Effort - Technical']: item?.projectItems?.nodes?.[0]?.effortTechnical?.value,
        ['Effort - Nontechnical']: item?.projectItems?.nodes?.[0]?.effortNontechnical?.value,
        ['Impact']: item?.projectItems?.nodes?.[0]?.impact?.value,
        ['Status']: item?.projectItems?.nodes?.[0]?.status?.value,
        ['Issue Type']: item?.projectItems?.nodes?.[0]?.issueType?.value,
        ['Repo']: item?.repository?.name,
        ['Url']: item.url,
        ['Created']: format(new Date(item.createdAt), 'yyyy-MM-dd'),
        ['Closed Date']: format(new Date(item.closedAt), 'yyyy-MM-dd'),
        ['Closed Week']: format(startOfWeek(new Date(item.closedAt)), 'yyyy-MM-dd'),
        ['Closed Month']: format(startOfMonth(new Date(item.closedAt)), 'yyyy-MM-dd'),
        ['Milestone']: item.milestone?.title,
        State:
          item.state === 'CLOSED' && item.stateReason === 'NOT_PLANNED'
            ? 'CLOSED_NOT_PLANNED'
            : item.state,
        ['Computed - Days Of Effort']: getComputedDaysOfEffort(item),
        ['Labels']: item.labels?.nodes.map(label => label.name).join(', '),
      }
    })
  })
  const worksheet = xlsx.utils.json_to_sheet(rows)

  xlsx.utils.book_append_sheet(workbook, worksheet, 'Main')
  await xlsx.writeFile(workbook, './src/bin/localCache/projectReport.xlsx')
}
