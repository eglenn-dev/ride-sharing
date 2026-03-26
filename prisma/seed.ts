import { PrismaClient } from '../src/generated/prisma/client.js'

import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Clear in reverse-dependency order
  await prisma.notification.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.ride.deleteMany()

  // Upsert test users for dev convenience
  const alice = await prisma.user.upsert({
    where: { id: 'seed-alice' },
    update: {},
    create: {
      id: 'seed-alice',
      name: 'Alice Driver',
      email: 'alice@example.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  const bob = await prisma.user.upsert({
    where: { id: 'seed-bob' },
    update: {},
    create: {
      id: 'seed-bob',
      name: 'Bob Rider',
      email: 'bob@example.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  const carol = await prisma.user.upsert({
    where: { id: 'seed-carol' },
    update: {},
    create: {
      id: 'seed-carol',
      name: 'Carol Commuter',
      email: 'carol@example.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
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
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
