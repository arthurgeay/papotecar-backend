import ConflictException from 'App/Exceptions/ConflictException'
import Trip from 'App/Models/Trip'
import User from 'App/Models/User'

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
}
