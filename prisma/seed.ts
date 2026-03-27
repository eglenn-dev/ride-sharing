import { PrismaClient } from '../src/generated/prisma/client.js'
import { auth } from '../src/lib/auth'

import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

const SEEDED_USER_PASSWORD = 'password123'

type SeedUser = {
  name: string
  email: string
}

async function ensureSeedUser({ name, email }: SeedUser) {
  const existingUser = await prisma.user.findFirst({
    where: { email },
    include: {
      accounts: {
        select: {
          providerId: true,
        },
      },
    },
  })

  if (existingUser) {
    const hasCredentialAccount = existingUser.accounts.some(
      (account) => account.providerId === 'credential',
    )

    if (hasCredentialAccount) {
      return existingUser
    }

    await prisma.user.delete({
      where: {
        id: existingUser.id,
      },
    })
  }

  await auth.api.signUpEmail({
    body: {
      name,
      email,
      password: SEEDED_USER_PASSWORD,
    },
    asResponse: false,
  })

  const createdUser = await prisma.user.findFirst({
    where: { email },
  })

  if (!createdUser) {
    throw new Error(`Failed to create seeded auth user for ${email}`)
  }

  return createdUser
}

async function main() {
  console.log('🌱 Seeding database...')

  // Clear in reverse-dependency order
  await prisma.notification.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.ride.deleteMany()

  // Create test users with Better Auth credentials so they can sign in.
  const alice = await ensureSeedUser({
    name: 'Alice Driver',
    email: 'alice@example.com',
  })

  const bob = await ensureSeedUser({
    name: 'Bob Rider',
    email: 'bob@example.com',
  })

  const carol = await ensureSeedUser({
    name: 'Carol Commuter',
    email: 'carol@example.com',
  })

  console.log(`✅ Upserted 3 test users`)

  // Create sample rides
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(8, 0, 0, 0)

  const dayAfter = new Date()
  dayAfter.setDate(dayAfter.getDate() + 2)
  dayAfter.setHours(9, 0, 0, 0)

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(7, 30, 0, 0)

  const ride1 = await prisma.ride.create({
    data: {
      driverId: alice.id,
      origin: 'Downtown Austin',
      destination: 'UT Campus',
      departureTime: tomorrow,
      seats: 4,
      availableSeats: 3,
      price: 8.5,
      type: 'SHARED',
      description: 'Daily morning commute, happy to chat or keep quiet!',
    },
  })

  await prisma.ride.create({
    data: {
      driverId: alice.id,
      origin: 'UT Campus',
      destination: 'Downtown Austin',
      departureTime: new Date(tomorrow.getTime() + 9 * 60 * 60 * 1000), // 5pm same day
      seats: 4,
      availableSeats: 4,
      price: 8.5,
      type: 'SHARED',
      description: 'Evening return trip',
    },
  })

  const ride3 = await prisma.ride.create({
    data: {
      driverId: carol.id,
      origin: 'Round Rock',
      destination: 'Downtown Austin',
      departureTime: dayAfter,
      seats: 3,
      availableSeats: 2,
      price: 12.0,
      type: 'SHARED',
    },
  })

  await prisma.ride.create({
    data: {
      driverId: alice.id,
      origin: 'Austin Airport',
      destination: 'San Marcos',
      departureTime: nextWeek,
      seats: 3,
      availableSeats: 3,
      price: 25.0,
      type: 'EXCLUSIVE',
      description: 'Airport pickup — exclusive ride, no other passengers',
    },
  })

  const ride5 = await prisma.ride.create({
    data: {
      driverId: bob.id,
      origin: 'Cedar Park',
      destination: 'Downtown Austin',
      departureTime: dayAfter,
      seats: 2,
      availableSeats: 1,
      price: 10.0,
      type: 'SHARED',
    },
  })

  console.log(`✅ Created 5 sample rides`)

  // Create sample bookings (and availableSeats are already set accordingly above)
  await prisma.booking.create({
    data: {
      riderId: bob.id,
      rideId: ride1.id,
      seatsBooked: 1,
    },
  })

  await prisma.booking.create({
    data: {
      riderId: bob.id,
      rideId: ride3.id,
      seatsBooked: 1,
    },
  })

  await prisma.booking.create({
    data: {
      riderId: carol.id,
      rideId: ride5.id,
      seatsBooked: 1,
    },
  })

  console.log(`✅ Created 3 sample bookings`)

  // Create sample notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: alice.id,
        type: 'BOOKING_CREATED',
        message: `${bob.name} booked a seat on your ride from Downtown Austin to UT Campus`,
        rideId: ride1.id,
        isRead: true,
      },
      {
        userId: bob.id,
        type: 'RIDE_UPDATED',
        message: `The ride from Round Rock to Downtown Austin has been updated`,
        rideId: ride3.id,
        isRead: false,
      },
    ],
  })

  console.log(`✅ Created 2 sample notifications`)

  console.log('✅ Seed login credentials:')
  console.log('   alice@example.com / password123')
  console.log('   bob@example.com / password123')
  console.log('   carol@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
