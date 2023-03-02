import ConflictException from 'App/Exceptions/ConflictException'
import Trip from 'App/Models/Trip'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

export class TripService {
  public static async isDriverOrPassengerAlreadyBooked(
    user: User,
    departureDatetime: DateTime,
    trip?: Trip
  ) {
    const driverQuery = Trip.query()
      .where('driver_id', user.id)
      .where('departure_datetime', departureDatetime.toSQL())

    if (trip) {
      driverQuery.whereNot('id', trip.id)
    }

    const driverAlreadyBooked = await driverQuery.first()

    if (driverAlreadyBooked) {
      throw new ConflictException('Driver already booked', 400, 'E_DRIVER_ALREADY_BOOKED')
    }

    const isPassenger = await Trip.query()
      .whereHas('passengers', (query) => {
        query.where('user_id', user.id).where('departure_datetime', departureDatetime.toSQL())
      })
      .first()

    if (isPassenger) {
      throw new ConflictException(
        'User is a passenger on a trip on the same date',
        400,
        'E_USER_ALREADY_BOOKED'
      )
    }
  }
}
