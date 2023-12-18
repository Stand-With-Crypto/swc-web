import { Inter } from 'next/font/google'

// TODO replace with font we want
const inter = Inter({ subsets: ['latin'] })
export const dynamic = 'error'

export default function NotFound() {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="prose-sm mx-auto mt-10 w-full max-w-xl p-4">
          <h1>root not found</h1>
          {/* TODO */}
        </main>
      </body>
    </html>
  )
}
