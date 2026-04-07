import { execSync } from 'node:child_process'

export default async function globalSetup() {
  console.log('[playwright] seeding database via pnpm db:seed...')
  execSync('pnpm db:seed', { stdio: 'inherit' })
}
