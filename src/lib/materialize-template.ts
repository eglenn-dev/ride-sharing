import { prisma } from '#/db'

type TemplateLike = {
  id: string
  driverId: string
  origin: string
  destination: string
  type: 'SHARED' | 'EXCLUSIVE'
  seats: number
  price: number
  description: string | null
  daysOfWeek: Array<number>
  departureHour: number
  departureMin: number
  startsOn: Date
  endsOn: Date | null
  isPaused: boolean
}

function* enumerateOccurrences(template: TemplateLike, untilDate: Date) {
  const start = new Date(Math.max(template.startsOn.getTime(), Date.now()))
  start.setHours(0, 0, 0, 0)

  const end = template.endsOn
    ? new Date(Math.min(template.endsOn.getTime(), untilDate.getTime()))
    : untilDate

  const cursor = new Date(start)
  while (cursor <= end) {
    if (template.daysOfWeek.includes(cursor.getDay())) {
      const occurrence = new Date(cursor)
      occurrence.setHours(
        template.departureHour,
        template.departureMin,
        0,
        0,
      )
      if (occurrence.getTime() > Date.now()) {
        yield occurrence
      }
    }
    cursor.setDate(cursor.getDate() + 1)
  }
}

export async function materializeTemplate(
  template: TemplateLike,
  untilDate: Date,
): Promise<number> {
  if (template.isPaused) return 0

  const occurrences = Array.from(enumerateOccurrences(template, untilDate))
  if (occurrences.length === 0) return 0

  let created = 0
  for (const departureTime of occurrences) {
    const existing = await prisma.ride.findFirst({
      where: {
        templateId: template.id,
        departureTime,
      },
    })
    if (existing) continue

    await prisma.ride.create({
      data: {
        driverId: template.driverId,
        origin: template.origin,
        destination: template.destination,
        departureTime,
        seats: template.seats,
        availableSeats: template.seats,
        price: template.price,
        type: template.type,
        description: template.description,
        templateId: template.id,
      },
    })
    created += 1
  }
  return created
}
