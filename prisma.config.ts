<<<<<<< HEAD
import { defineConfig } from 'prisma/config'
=======
import dotenv from 'dotenv'
import { defineConfig, env } from 'prisma/config'
>>>>>>> origin/main

dotenv.config({ path: '.env.local' })

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Use a local fallback so `prisma generate` still works before env setup.
    url:
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/postgres',
  },
})
