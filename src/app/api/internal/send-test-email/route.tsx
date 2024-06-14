import { render } from '@react-email/components'
import { NextResponse } from 'next/server'

import { sendMultipleMails } from '@/lib/email'
import InitialSignUpEmail from '@/lib/email/templates/initialSignUp'

export const dynamic = 'force-dynamic'

export async function GET() {
  const messageIds = await sendMultipleMails([
    {
      to: 'lucas.rmagalhaes@gmail.com',
      subject: 'SWC to Lucas',
      html: render(<InitialSignUpEmail completedActionTypes={['EMAIL', 'VOTER_REGISTRATION']} />),
    },
    {
      to: 'lucasrodrigues.demagalhaespessone@coinbase.com',
      subject: 'SWC to Coinbase',
      html: render(<InitialSignUpEmail completedActionTypes={['NFT_MINT']} />),
    },
  ])

  return NextResponse.json({ messageIds })
}
