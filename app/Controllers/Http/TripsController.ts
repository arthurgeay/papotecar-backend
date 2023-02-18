import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Trip from 'App/Models/Trip'
import CreateTripValidator from 'App/Validators/CreateTripValidator'
import LocationService from 'App/Services/LocationService'

export default class TripsController {
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = 10

    return await Trip.query()
      .preload('driver')
      .preload('departureLocation')
      .preload('arrivalLocation')
      .paginate(page, limit)
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(CreateTripValidator)

    const driverAlreadyBooked = await Trip.query()
      .where('driver_id', auth.user!.id)
      .where('departure_datetime', payload.departure_datetime.toString())
      .first()

    if (driverAlreadyBooked) {
      return response.status(400).send({ message: 'Driver already booked' })
    }

    const departureLocationId = await LocationService.getLocation(
      payload.departure_location.name,
      payload.departure_location.longitude,
      payload.departure_location.latitude
    )

    const arrivalLocationId = await LocationService.getLocation(
      payload.arrival_location.name,
      payload.arrival_location.longitude,
      payload.arrival_location.latitude
    )

    const trip = await Trip.create({
      departureLocationId,
      arrivalLocationId,
      departureDatetime: payload.departure_datetime,
      maxPassengers: payload.max_passengers,
      price: payload.price,
      driverId: auth.user!.id,
      content: payload.content,
    })

    return trip

    // TODO : A faire plus tard pour la création d'un trip
    // TODO : Conducteur ne doit pas être passager sur un autre trajet à la même date
    // TODO : Créer également une conversation et un message de base
  }
}
