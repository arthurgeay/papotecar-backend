import ConflictException from 'App/Exceptions/ConflictException'
import Trip from 'App/Models/Trip'
import User from 'App/Models/User'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UuidParamValidator from 'App/Validators/UuidParamValidator'

export class PassengerService {
  public static async isAlreadyRegistered(trip: Trip, user: User) {
    const currentUserRegistered = await Trip.query()
      .where('id', trip.id)
      .whereHas('passengers', (query) => {
        query.where('user_id', user.id)
      })
      .first()

    if (currentUserRegistered) {
      throw new ConflictException(
        'You are already registered for this trip',
        400,
        'E_ALREADY_REGISTERED'
      )
    }
  }

  public static async updatePassengerStatus(
    { request, bouncer }: HttpContextContract,
    isApproved: boolean
  ) {
    const payload = await request.validate(UuidParamValidator)

    const trip = await Trip.query()
      .where('id', payload.params.id)
      .whereHas('passengers', (query) => {
        query.where('user_id', payload.params.passengerId!)
      })
      .firstOrFail()

    await bouncer.with('PassengerPolicy').authorize('update', trip)

    if (isApproved) {
      await trip
        .related('passengers')
        .pivotQuery()
        .where('user_id', payload.params.passengerId!)
        .update({
          is_approve: true,
        })
    } else {
      await trip.related('passengers').detach([payload.params.passengerId!])
    }
  }
}
