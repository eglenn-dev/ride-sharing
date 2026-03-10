# Prisma Cheat Sheet

Prisma is an ORM (Object-Relational Mapper) for Node.js/TypeScript. It lets you interact with your PostgreSQL database using TypeScript instead of raw SQL.

## How It Works

There are three main pieces:

1. **Schema** (`prisma/schema.prisma`) — you define your database tables here as "models"
2. **Prisma Client** (`src/generated/prisma/`) — auto-generated TypeScript code that gives you type-safe database queries
3. **Migrations** — Prisma tracks changes to your schema and generates SQL to update your database

Whenever you change the schema, you regenerate the client and run a migration.

---

## Project Scripts

All scripts load `.env.local` automatically via `dotenv-cli`.

```bash
pnpm db:generate   # Regenerate the typed Prisma Client after schema changes
pnpm db:migrate    # Create and apply a migration (prompts for a name)
pnpm db:push       # Push schema to DB without creating a migration file (good for prototyping)
pnpm db:studio     # Open a browser-based GUI to view/edit your data
pnpm db:seed       # Run prisma/seed.ts to populate the DB with sample data
```

---

## The Schema File

Located at `prisma/schema.prisma`. Here's what a model looks like:

```prisma
model User {
  id        String   @id           // primary key
  name      String
  email     String   @unique       // unique constraint
  age       Int?                   // ? means nullable
  role      String   @default("user")
  createdAt DateTime @default(now())
  posts     Post[]                 // one-to-many relation

  @@map("user")                    // actual table name in PostgreSQL
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  userId   String
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("post")
}
```

### Common Field Attributes

| Attribute              | What it does                          |
|------------------------|---------------------------------------|
| `@id`                  | Primary key                           |
| `@unique`              | Unique constraint                     |
| `@default(value)`      | Default value                         |
| `@default(autoincrement())` | Auto-incrementing integer        |
| `@default(now())`      | Current timestamp                     |
| `@default(uuid())`     | Auto-generate a UUID                  |
| `?` after type         | Makes the field nullable              |
| `@relation`            | Defines a foreign key relationship    |
| `@@map("name")`        | Map model to a specific table name    |
| `@@index([field])`     | Add a database index                  |

---

## Querying Data

Import the singleton client and call methods on your models:

```ts
import { prisma } from '#/db'
```

### Create

```ts
const user = await prisma.user.create({
  data: {
    name: 'Alice',
    email: 'alice@example.com',
  },
})
```

### Create Many

```ts
const result = await prisma.user.createMany({
  data: [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
  ],
})
// result.count === 2
```

### Find One

```ts
// By primary key
const user = await prisma.user.findUnique({
  where: { id: 'abc123' },
})

// By any unique field
const user = await prisma.user.findUnique({
  where: { email: 'alice@example.com' },
})

// First match (non-unique fields)
const user = await prisma.user.findFirst({
  where: { name: 'Alice' },
})
```

### Find Many

```ts
// All users
const users = await prisma.user.findMany()

// With filtering
const users = await prisma.user.findMany({
  where: {
    name: { contains: 'ali', mode: 'insensitive' },
    createdAt: { gte: new Date('2025-01-01') },
  },
})

// With sorting
const users = await prisma.user.findMany({
  orderBy: { createdAt: 'desc' },
})

// With pagination
const users = await prisma.user.findMany({
  skip: 10,
  take: 5,
})
```

### Update

```ts
const user = await prisma.user.update({
  where: { id: 'abc123' },
  data: { name: 'Alice Updated' },
})
```

### Delete

```ts
await prisma.user.delete({
  where: { id: 'abc123' },
})

// Delete many
await prisma.user.deleteMany({
  where: { role: 'guest' },
})
```

### Count

```ts
const count = await prisma.user.count({
  where: { role: 'admin' },
})
```

---

## Filtering Operators

Use these inside `where` clauses:

```ts
where: {
  name: { equals: 'Alice' },         // exact match (default)
  name: { not: 'Alice' },            // not equal
  name: { contains: 'lic' },         // LIKE '%lic%'
  name: { startsWith: 'Al' },        // LIKE 'Al%'
  name: { endsWith: 'ce' },          // LIKE '%ce'
  name: { mode: 'insensitive' },     // case-insensitive (combine with above)
  age: { gt: 18 },                   // greater than
  age: { gte: 18 },                  // greater than or equal
  age: { lt: 65 },                   // less than
  age: { lte: 65 },                  // less than or equal
  age: { in: [18, 21, 25] },         // in list
  age: { notIn: [18, 21, 25] },      // not in list
  email: { not: null },              // is not null
}
```

### AND / OR / NOT

```ts
where: {
  AND: [
    { role: 'admin' },
    { createdAt: { gte: new Date('2025-01-01') } },
  ],
}

where: {
  OR: [
    { email: { contains: '@gmail.com' } },
    { email: { contains: '@yahoo.com' } },
  ],
}
```

---

## Relations (Joins)

### Include Related Data

```ts
const user = await prisma.user.findUnique({
  where: { id: 'abc123' },
  include: {
    posts: true,       // include all posts
    sessions: true,    // include all sessions
  },
})
// user.posts is now Post[]
```

### Select Specific Fields

```ts
const user = await prisma.user.findUnique({
  where: { id: 'abc123' },
  select: {
    name: true,
    email: true,
    posts: {
      select: { title: true },
    },
  },
})
// Returns only { name, email, posts: [{ title }] }
```

### Nested Create

```ts
const user = await prisma.user.create({
  data: {
    name: 'Alice',
    email: 'alice@example.com',
    posts: {
      create: [
        { title: 'First post' },
        { title: 'Second post' },
      ],
    },
  },
  include: { posts: true },
})
```

### Filter by Relation

```ts
// Find users who have at least one post
const users = await prisma.user.findMany({
  where: {
    posts: { some: { title: { contains: 'prisma' } } },
  },
})
```

---

## Transactions

When you need multiple operations to succeed or fail together:

```ts
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: { name: 'Alice', email: 'alice@example.com' } }),
  prisma.post.create({ data: { title: 'Hello', userId: 'abc123' } }),
])

// Or with interactive transactions for dependent operations:
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { name: 'Alice', email: 'alice@example.com' },
  })
  const post = await tx.post.create({
    data: { title: 'Hello', userId: user.id },
  })
  return { user, post }
})
```

---

## Workflow for Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `pnpm db:generate` to regenerate the typed client
3. Run `pnpm db:migrate` to create a migration and apply it

Use `pnpm db:push` instead of `db:migrate` when prototyping — it syncs the DB without creating migration files.

---

## Useful Commands

```bash
# Reset the database (drops all data, re-runs migrations, re-seeds)
pnpm dotenv -e .env.local -- prisma migrate reset

# See the SQL a migration would generate without applying it
pnpm dotenv -e .env.local -- prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma

# Format the schema file
pnpm dotenv -e .env.local -- prisma format

# Check migration status
pnpm dotenv -e .env.local -- prisma migrate status
```

---

## Common Gotchas

- **Always run `db:generate` after changing the schema.** The TypeScript types won't update until you do.
- **`findUnique` requires a unique/ID field in `where`.** Use `findFirst` for non-unique fields.
- **Nullable fields need `?`** in the schema. Without it, Prisma will require a value on create.
- **Relations need both sides defined.** A `Post` with `userId` needs the `@relation` attribute, and the `User` model needs a `Post[]` field.
- **`deleteMany({})` with empty where deletes everything.** Be careful.
- **Prisma Client is generated code** — don't edit files in `src/generated/prisma/`. They get overwritten on `db:generate`.
