import { render } from '@react-email/components'
import { NextResponse } from 'next/server'

import { sendMail } from '@/lib/email'
import InitialSignUpEmail from '@/lib/email/templates/initialSignUp'

export const dynamic = 'force-dynamic'

export async function GET() {
  const messageId = await sendMail({
    to: 'lucas.rmagalhaes@gmail.com',
    subject: 'Welcome to Stand With Crypto',
    html: render(<InitialSignUpEmail completedActionTypes={['EMAIL', 'VOTER_REGISTRATION']} />),
  })
  return NextResponse.json({ messageId })
}
