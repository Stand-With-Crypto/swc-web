import SendGrid from '@sendgrid/mail'

import { requiredEnv } from '@/utils/shared/requiredEnv'

const SENDGRID_API_KEY = requiredEnv(process.env.SENDGRID_API_KEY, 'process.env.SENDGRID_API_KEY')

SendGrid.setApiKey(SENDGRID_API_KEY)

export async function sendMail() {
  return SendGrid.send({
    to: 'lucas.rmagalhaes@gmail.com',
    from: 'lucas.rmagalhaes@gmail.com',
    subject: `Hello World ${new Date().toISOString()}`,
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  })
    .then(console.log)
    .catch(console.error)
}
