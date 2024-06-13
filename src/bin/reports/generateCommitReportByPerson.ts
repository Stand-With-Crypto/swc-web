import { format } from 'date-fns'
import { debounce } from 'lodash-es'
import path from 'path'
import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { fetchReq } from '@/utils/shared/fetchReq'

const GITHUB_API_URL = 'https://api.github.com/graphql'

interface Commit {
  message: string
  author: {
    name: string
  }
  additions: number
  deletions: number
  committedDate: string
  changedFilesIfAvailable: number
  associatedPullRequests: {
    nodes: Array<{
      title: string
    }>
  }
  url: string
  repository: {
    name: string
  }
}

interface GithubCommitDataResponse {
  data: {
    repository: {
      ref: {
        target: {
          history: {
            nodes: Array<Commit>
            pageInfo: {
              hasNextPage: boolean
              endCursor?: string
            }
          }
        }
      }
    }
  }
}

export const GITHUB_COMMIT_DATA_FROM_MAIN_BRANCH_QUERY = /* GraphQL */ `
  query ($owner: String!, $name: String!, $after: String) {
    repository(owner: $owner, name: $name) {
      ref(qualifiedName: "main") {
        target {
          ... on Commit {
            history(first: 100, after: $after) {
              nodes {
                message
                author {
                  name
                }
                associatedPullRequests(first: 1) {
                  nodes {
                    title
                  }
                }
                additions
                deletions
                changedFilesIfAvailable
                url
                committedDate
                repository {
                  name
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      }
    }
  }
`
async function getGithubCommitData(commits: Commit[], repositoryName: string, after?: string) {
  // This is required because there is a rate limit in Github API. https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
  const MAX_REQUESTS_PER_MINUTE = 100
  const REQUEST_INTERVAL = (60 * 1000) / MAX_REQUESTS_PER_MINUTE

  const response = await fetchReq(GITHUB_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN ?? ''}`,
    },
    body: JSON.stringify({
      query: GITHUB_COMMIT_DATA_FROM_MAIN_BRANCH_QUERY,
      variables: {
        owner: 'Stand-With-Crypto',
        name: repositoryName,
        after,
      },
    }),
  })

  const { data } = (await response.json()) as GithubCommitDataResponse
  const repository = data.repository
  const commitsFromMainBranch = repository?.ref?.target?.history ?? {
    nodes: [],
    pageInfo: { hasNextPage: false },
  }

  commits.push(...commitsFromMainBranch.nodes)

  if (commitsFromMainBranch.pageInfo.hasNextPage) {
    debounce(
      () =>
        void getGithubCommitData(commits, repositoryName, commitsFromMainBranch.pageInfo.endCursor),
      REQUEST_INTERVAL,
    )
  }
}

async function generateProjectData() {
  console.log('Generating commit report by person. Please wait...')

  const commits: Commit[] = []

  await getGithubCommitData(commits, 'swc-web')
  await getGithubCommitData(commits, 'swc-internal')

  await generateCommitReportByPerson(commits)

  console.log('Generated commit report by person successfully!')
}

void runBin(generateProjectData)

async function generateCommitReportByPerson(commits: Commit[]) {
  const commitsByPerson = commits.reduce(
    (acc, commit) => {
      if (!acc[commit.author.name]) {
        acc[commit.author.name] = []
      }

      acc[commit.author.name].push(commit)

      return acc
    },
    {} as Record<string, Commit[]>,
  )

  const workbook = xlsx.utils.book_new()

  Object.entries(commitsByPerson).forEach(([author, _commits]) => {
    const commitsOrderedDesc = _commits.sort(
      (a, b) => new Date(b.committedDate).getTime() - new Date(a.committedDate).getTime(),
    )

    const worksheet = xlsx.utils.json_to_sheet(
      commitsOrderedDesc.map((item: Commit) => {
        return {
          ['Author']: item.author.name,
          ['Additions']: item.additions,
          ['Deletions']: item.deletions,
          ['Committed Date']: format(new Date(item.committedDate), 'yyyy-MM-dd'),
          ['Changed Files']: item.changedFilesIfAvailable,
          ['Repo']: item.repository.name,
          ['Commit Message']: item.message,
          ['Pull Request']: item.associatedPullRequests.nodes[0]?.title ?? '---',
          ['Url']: item.url,
        }
      }),
    )

    xlsx.utils.book_append_sheet(workbook, worksheet, `${author} - ${_commits.length} commits`)
  })

  await xlsx.writeFile(workbook, './src/bin/localCache/commitsReportByPerson.xlsx')
}
