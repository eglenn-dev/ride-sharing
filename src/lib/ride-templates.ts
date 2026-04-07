import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { prisma } from '#/db'
import { requireServerSession } from '#/lib/auth-session'
import { rideTemplateInputSchema } from '#/lib/schemas'

export const createRideTemplate = createServerFn({ method: 'POST' })
  .inputValidator(rideTemplateInputSchema)
  .handler(async ({ data }) => {
    const { user } = await requireServerSession()

    const template = await prisma.rideTemplate.create({
      data: {
        driverId: user.id,
        origin: data.origin,
        destination: data.destination,
        type: data.type,
        seats: data.seats,
        price: data.price,
        description: data.description,
        daysOfWeek: data.daysOfWeek,
        departureHour: data.departureHour,
        departureMin: data.departureMin,
        startsOn: new Date(data.startsOn),
        endsOn: data.endsOn ? new Date(data.endsOn) : null,
      },
    })

    const until = new Date()
    until.setDate(until.getDate() + MATERIALIZE_DAYS_AHEAD)
    await materializeTemplate(template, until)

    return template
  })

const updateTemplateSchema = rideTemplateInputSchema.extend({
  id: z.string().min(1),
})

export const updateRideTemplate = createServerFn({ method: 'POST' })
  .inputValidator(updateTemplateSchema)
  .handler(async ({ data }) => {
    const { user } = await requireServerSession()

    const existing = await prisma.rideTemplate.findFirst({
      where: { id: data.id, driverId: user.id },
    })
    if (!existing) throw new Error('Template not found')

    const updated = await prisma.rideTemplate.update({
      where: { id: data.id },
      data: {
        origin: data.origin,
        destination: data.destination,
        type: data.type,
        seats: data.seats,
        price: data.price,
        description: data.description,
        daysOfWeek: data.daysOfWeek,
        departureHour: data.departureHour,
        departureMin: data.departureMin,
        startsOn: new Date(data.startsOn),
        endsOn: data.endsOn ? new Date(data.endsOn) : null,
      },
    })

    // Cascade non-destructive edits to future un-booked materialized rides
    await prisma.ride.updateMany({
      where: {
        templateId: data.id,
        departureTime: { gt: new Date() },
        status: 'ACTIVE',
        bookings: { none: { status: 'CONFIRMED' } },
      },
      data: {
        origin: data.origin,
        destination: data.destination,
        type: data.type,
        seats: data.seats,
        availableSeats: data.seats,
        price: data.price,
        description: data.description,
      },
    })

    return updated
  })

const idSchema = z.object({ id: z.string().min(1) })

export const pauseRideTemplate = createServerFn({ method: 'POST' })
  .inputValidator(idSchema)
  .handler(async ({ data }) => {
    const { user } = await requireServerSession()
    const result = await prisma.rideTemplate.updateMany({
      where: { id: data.id, driverId: user.id },
      data: { isPaused: true },
    })
    if (result.count === 0) throw new Error('Template not found')
  })

export const resumeRideTemplate = createServerFn({ method: 'POST' })
  .inputValidator(idSchema)
  .handler(async ({ data }) => {
    const { user } = await requireServerSession()
    const result = await prisma.rideTemplate.updateMany({
      where: { id: data.id, driverId: user.id },
      data: { isPaused: false },
    })
    if (result.count === 0) throw new Error('Template not found')
  })

export const deleteRideTemplate = createServerFn({ method: 'POST' })
  .inputValidator(idSchema)
  .handler(async ({ data }) => {
    const { user } = await requireServerSession()

    const existing = await prisma.rideTemplate.findFirst({
      where: { id: data.id, driverId: user.id },
    })
    if (!existing) throw new Error('Template not found')

    // soft-cancel future un-booked materialized rides
    await prisma.ride.updateMany({
      where: {
        templateId: data.id,
        departureTime: { gt: new Date() },
        status: 'ACTIVE',
        bookings: { none: { status: 'CONFIRMED' } },
      },
      data: { status: 'CANCELLED' },
    })

    await prisma.rideTemplate.delete({ where: { id: data.id } })
  })

export const listRideTemplates = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { user } = await requireServerSession()
    return prisma.rideTemplate.findMany({
      where: { driverId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { rides: { where: { status: 'ACTIVE' } } },
        },
      },
    })
  },
)

export const getRideTemplate = createServerFn({ method: 'GET' })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { user } = await requireServerSession()
    const template = await prisma.rideTemplate.findFirst({
      where: { id, driverId: user.id },
    })
    if (!template) throw new Error('Template not found')
    return template
  })
