import { z } from 'zod'

export const rideTypeSchema = z.enum(['SHARED', 'EXCLUSIVE'])

export const createRideSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  departureTime: z.iso.datetime(),
  seats: z.int().positive(),
  price: z.number().nonnegative(),
  type: rideTypeSchema,
  description: z.string().optional(),
})

export const rideIdSchema = z.string().min(1)

export const bookingIdSchema = z.string().min(1)

export const searchRidesSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  date: z.string().optional(),
  type: rideTypeSchema.optional(),
})

export const createBookingSchema = z.object({
  rideId: z.string().min(1),
  seats: z.int().positive().optional(),
})

export const cancelBookingSchema = bookingIdSchema

export const submitReviewSchema = z.object({
  rideId: z.string().min(1),
  subjectId: z.string().min(1),
  rating: z.int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
})

export const rideTemplateInputSchema = z.object({
  origin: z.string().trim().min(1),
  destination: z.string().trim().min(1),
  type: rideTypeSchema,
  seats: z.int().positive(),
  price: z.number().nonnegative(),
  description: z.string().trim().max(1000).optional(),
  daysOfWeek: z.array(z.int().min(0).max(6)).min(1),
  departureHour: z.int().min(0).max(23),
  departureMin: z.int().min(0).max(59),
  startsOn: z.iso.datetime(),
  endsOn: z.iso.datetime().optional(),
})

export const sendMessageSchema = z.object({
  threadId: z.string().min(1),
  body: z.string().trim().min(1).max(2000),
})

export class ApiError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status = 400) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

export const apiErrors = {
  unauthorized: () => new ApiError('UNAUTHORIZED', 'Not authenticated', 401),
  notFound: (resource: string) =>
    new ApiError('NOT_FOUND', `${resource} not found`, 404),
  forbidden: (message = 'Forbidden') =>
    new ApiError('FORBIDDEN', message, 403),
  validation: (message: string) =>
    new ApiError('VALIDATION', message, 400),
  conflict: (message: string) => new ApiError('CONFLICT', message, 409),
}
