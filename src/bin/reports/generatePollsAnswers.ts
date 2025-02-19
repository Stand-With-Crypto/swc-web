import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { getPollsResultsData } from '@/data/polls/getPollsData'

async function generatePollsAnswers() {
  const pollsResultsData = await getPollsResultsData()

  const pollsAnswers = Object.values(pollsResultsData).flatMap(poll => {
    return {
      campaignName: poll.campaignName,
      answers: poll.computedAnswers.map(answer => ({
        answer: answer.answer,
        isOtherAnswer: answer.isOtherAnswer,
        totalVotes: answer.totalVotes,
      })),
    }
  })

  console.log(pollsAnswers)

  const workbook = xlsx.utils.book_new()

  pollsAnswers.forEach((poll, idx) => {
    // Create worksheet
    const worksheet = xlsx.utils.aoa_to_sheet([[`Campaign Name: ${poll.campaignName}`]])

    // Add hyperlink to campaign name
    worksheet['A1'] = { t: 's', v: `Campaign Name: ${poll.campaignName}` }
    worksheet['A1'].l = {
      Target: `https://builder.io/content/${poll.campaignName}`,
      Tooltip: `View ${poll.campaignName} in Builder.io`,
    }

    // Add answers data starting at A2
    const answersData = poll.answers.map(answer => ({
      Answer: answer.answer,
      'Is Other Answer': answer.isOtherAnswer,
      'Total Votes': answer.totalVotes,
    }))
    xlsx.utils.sheet_add_json(worksheet, answersData, { origin: 'A2' })

    xlsx.utils.book_append_sheet(workbook, worksheet, `Poll ${idx + 1}`)
  })

  await xlsx.writeFile(workbook, './src/bin/localCache/pollsAnswers.xlsx')
}

void runBin(generatePollsAnswers)
