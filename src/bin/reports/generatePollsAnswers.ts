import { format } from 'date-fns'
import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { getPollsWithAbsoluteResults } from '@/data/polls/getPollsData'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

async function generatePollsAnswers() {
  const pollsWithResults = await getPollsWithAbsoluteResults({
    countryCode: SupportedCountryCodes.US,
  })

  const pollsAnswers = pollsWithResults.map(poll => {
    return {
      pollId: poll.pollData.id,
      endDate: poll.pollData.endDate,
      allowOther: poll.pollData.allowOther,
      maxNumberOptionsSelected: poll.pollData.maxNumberOptionsSelected,
      pollTitle: poll.pollData.pollTitle,
      answers: poll.computedAnswers.map(answer => ({
        answer: answer.answer,
        isOtherAnswer: answer.isOtherAnswer,
        totalVotes: answer.totalVotes,
      })),
    }
  })

  const workbook = xlsx.utils.book_new()

  pollsAnswers.forEach((poll, idx) => {
    const worksheet = xlsx.utils.aoa_to_sheet([[`Poll Id: ${poll.pollId}`]])

    worksheet['A1'] = { t: 's', v: `Campaign Name: ${poll.pollId}` }
    worksheet['A1'].l = {
      Target: `https://builder.io/content/${poll.pollId}`,
      Tooltip: `View ${poll.pollId} in Builder.io`,
    }

    worksheet['A2'] = { t: 's', v: `Poll Title: ${poll.pollTitle}` }
    worksheet['A3'] = { t: 's', v: `Poll End date: ${format(poll.endDate, 'MM/dd/yyyy')}` }
    worksheet['A4'] = { t: 's', v: `Allows Other Answers: ${poll.allowOther ? 'Yes' : 'No'}` }

    if (poll.allowOther) {
      worksheet['A5'] = {
        t: 's',
        v: `Max Options Selected: ${poll.maxNumberOptionsSelected ?? 'Select all that apply'}`,
      }
    }

    const answersData = poll.answers.map(currentAnswer => ({
      Answer: currentAnswer.answer,
      'Is Other Answer': currentAnswer.isOtherAnswer,
      'Total Votes': currentAnswer.totalVotes,
    }))
    xlsx.utils.sheet_add_json(worksheet, answersData, { origin: 'A7' })

    xlsx.utils.book_append_sheet(workbook, worksheet, `Poll ${idx + 1}`)
  })

  await xlsx.writeFile(workbook, './src/bin/localCache/pollsAnswers.xlsx')
}

void runBin(generatePollsAnswers)
