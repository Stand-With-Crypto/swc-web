import { render } from '@react-email/components'
import { NextResponse } from 'next/server'

import { sendMail } from '@/lib/email'
import InitialSignUpEmail from '@/lib/email/templates/initialSignUp'

export async function GET() {
  const messageId = await sendMail({
    to: 'lucas.rmagalhaes@gmail.com',
    subject: 'SwC Test - ' + new Date().toISOString(),
    html: render(<InitialSignUpEmail completedActionTypes={['EMAIL', 'CALL']} />),
    customArgs: {
      variant: 'A',
    },
  })

  return NextResponse.json({ messageId })
}
