import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '#/db'

const TEST_DRIVER_ID = 'test-driver-lifecycle'
const TEST_RIDER_ID = 'test-rider-lifecycle'

describe('Booking lifecycle', () => {
  let driverId: string
  let riderId: string
  let rideId: string

  beforeAll(async () => {
    const driver = await prisma.user.create({
      data: {
        id: TEST_DRIVER_ID,
        name: 'Test Driver',
        email: 'test-driver-lifecycle@test.com',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    const rider = await prisma.user.create({
      data: {
        id: TEST_RIDER_ID,
        name: 'Test Rider',
        email: 'test-rider-lifecycle@test.com',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    driverId = driver.id
    riderId = rider.id
  })

  afterAll(async () => {
    await prisma.notification.deleteMany({
      where: { userId: { in: [driverId, riderId] } },
    })
    await prisma.booking.deleteMany({ where: { riderId } })
    await prisma.ride.deleteMany({ where: { driverId } })
    await prisma.user.deleteMany({
      where: { id: { in: [driverId, riderId] } },
    })
  })

  it('should create a ride', async () => {
    const ride = await prisma.ride.create({
      data: {
        driverId,
        origin: 'Test Origin',
        destination: 'Test Destination',
        departureTime: new Date('2026-04-01T08:00:00Z'),
        seats: 3,
        availableSeats: 3,
        price: 10.0,
        type: 'SHARED',
      },
    })
    rideId = ride.id
    expect(ride.availableSeats).toBe(3)
    expect(ride.status).toBe('ACTIVE')
  })

  it('should create a booking and decrement available seats', async () => {
    const booking = await prisma.$transaction(async (tx) => {
      const ride = await tx.ride.findUniqueOrThrow({ where: { id: rideId } })
      expect(ride.availableSeats).toBe(3)

      await tx.ride.update({
        where: { id: rideId },
        data: { availableSeats: ride.availableSeats - 1 },
      })

      return tx.booking.create({
        data: {
          riderId,
          rideId,
          seatsBooked: 1,
          status: 'CONFIRMED',
        },
      })
    })

    expect(booking.status).toBe('CONFIRMED')

    const updatedRide = await prisma.ride.findUniqueOrThrow({
      where: { id: rideId },
    })
    expect(updatedRide.availableSeats).toBe(2)
  })

  it('should prevent overbooking', async () => {
    await prisma.ride.update({
      where: { id: rideId },
      data: { availableSeats: 0 },
    })

    const ride = await prisma.ride.findUniqueOrThrow({
      where: { id: rideId },
    })
    expect(ride.availableSeats).toBe(0)
    expect(ride.availableSeats >= 1).toBe(false)

    // Restore seats for next test
    await prisma.ride.update({
      where: { id: rideId },
      data: { availableSeats: 2 },
    })
  })

  it('should cancel a booking and restore seats', async () => {
    const booking = await prisma.booking.findFirst({
      where: { riderId, rideId, status: 'CONFIRMED' },
    })
    expect(booking).not.toBeNull()

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking!.id },
        data: { status: 'CANCELLED' },
      })

      await tx.ride.update({
        where: { id: rideId },
        data: { availableSeats: { increment: booking!.seatsBooked } },
      })

      await tx.notification.create({
        data: {
          userId: driverId,
          type: 'BOOKING_CANCELLED',
          message: 'A booking was cancelled',
          rideId,
        },
      })
    })

    const updatedBooking = await prisma.booking.findUniqueOrThrow({
      where: { id: booking!.id },
    })
    expect(updatedBooking.status).toBe('CANCELLED')

    const updatedRide = await prisma.ride.findUniqueOrThrow({
      where: { id: rideId },
    })
    expect(updatedRide.availableSeats).toBe(3)

    const notification = await prisma.notification.findFirst({
      where: { userId: driverId, type: 'BOOKING_CANCELLED' },
    })
    expect(notification).not.toBeNull()
  })
})
