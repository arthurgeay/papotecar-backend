import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Trip from 'App/Models/Trip'
import CreateTripValidator from 'App/Validators/CreateTripValidator'
import Location from 'App/Models/Location'

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

    const existingDepartureLocation = await Location.query()
      .whereRaw('name = ? AND coordinates ~= POINT(?, ?)', [
        payload.departure_location.name,
        payload.departure_location.longitude,
        payload.departure_location.latitude,
      ])
      .first()

    let departureLocationId
    let arrivalLocationId

    if (existingDepartureLocation) {
      departureLocationId = existingDepartureLocation?.$attributes.id
    } else {
      const newLocation = await Location.create({
        name: payload.departure_location.name,
        coordinates: {
          longitude: payload.departure_location.longitude,
          latitude: payload.departure_location.latitude,
        },
      })
      departureLocationId = newLocation.id
    }

    const existingArrivalLocation = await Location.query()
      .whereRaw('name = ? AND coordinates ~= POINT(?, ?)', [
        payload.arrival_location.name,
        payload.arrival_location.longitude,
        payload.arrival_location.latitude,
      ])
      .first()

    if (existingArrivalLocation) {
      arrivalLocationId = existingArrivalLocation?.$attributes.id
    } else {
      const newLocation = await Location.create({
        name: payload.arrival_location.name,
        coordinates: {
          longitude: payload.arrival_location.longitude,
          latitude: payload.arrival_location.latitude,
        },
      })
      arrivalLocationId = newLocation.id
    }

    return await Trip.create({
      departureLocationId,
      arrivalLocationId,
      departureDatetime: payload.departure_datetime,
      maxPassengers: payload.max_passengers,
      price: payload.price,
      driverId: auth.user!.id,
      content: payload.content,
    })

    // TODO: Validateur
    // Date de départ > Date actuelle
    // Max passagers > 0
    // Prix > 0 && <= 100
    // Lieu de départ != lieu d'arrivée
    // Conducteur ne doit pas déjà être conducteur sur un autre trajet à la même date

    // TODO : A faire plus tard
    // TODO : Conducteur ne doit pas être passager sur un autre trajet à la même date
    // TODO : Créer également une conversation et un message de base
  }
}
