import { NavbarSessionButtonClient } from './navbarSessionButtonClient'

// TODO enable this once partial rehydration is fully supported in next.js
// export async function NavbarSessionButton() {
//   const session = await getServerSession(nextAuthConfig)
//   return <NavbarSessionButtonClient session={session} />
// }

export function NavbarSessionButton() {
  return <NavbarSessionButtonClient />
}
