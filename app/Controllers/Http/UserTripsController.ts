import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Trip from 'App/Models/Trip'

export default class UserTripsController {
  public async index({ auth }: HttpContextContract) {
    const trips = await Trip.query()
      .preload('arrivalLocation')
      .preload('departureLocation')
      .preload('driver')
      .preload('passengers')
      .where('driver_id', auth.user!.id)
      .orWhereHas('passengers', (query) => {
        query.where('user_id', auth.user!.id)
      })

    return {
      tripsAsDriver: trips.filter((trip) => trip.driverId === auth.user!.id),
      tripsAsPassenger: trips.filter((trip) => trip.driverId !== auth.user!.id),
    }
  }
}
