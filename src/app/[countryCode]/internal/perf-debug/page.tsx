export const revalidate = 30
export const dynamic = 'error'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export default async function PerfDebug() {
  await wait(5000)

  return (
    <div>
      <h1>PerfDebug</h1>
      <p>Refreshed at: {new Date().toISOString()}</p>
    </div>
  )
}
