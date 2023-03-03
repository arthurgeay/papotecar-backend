import { Point } from './../../Models/Location'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Trip from 'App/Models/Trip'
import TripValidator from 'App/Validators/TripValidator'
import LocationService from 'App/Services/LocationService'
import { DateTime } from 'luxon'

type Location = {
  name: string
  coordinates: Point
}

const DEFAULT_PAGE_LIMIT = 10

export default class TripsController {
  public async index({ request, response }: HttpContextContract) {
    const page = request.input('page', 1)
    const departureDatetimeFilter = request.input('departure_datetime', DateTime.now())
    const departureLocationFilter = request.input('departure_location')
    const arrivalLocation = request.input('arrival_location')
    const maxPassengersFilter = request.input('max_passengers', 1)

    if (!departureLocationFilter || !arrivalLocation) {
      return response.status(400).send({
        message: 'departure_location and arrival_location are required',
      })
    }

    return await Trip.query()
      .preload('driver')
      .preload('departureLocation', (departureLocationQuery) => {
        departureLocationQuery.where('name', departureLocationFilter)
      })
      .preload('arrivalLocation', (arrivalLocationQuery) => {
        arrivalLocationQuery.where('name', arrivalLocation)
      })
      .andWhere('maxPassengers', '>=', maxPassengersFilter)
      .andWhere('departureDatetime', '>=', DateTime.fromISO(departureDatetimeFilter).toSQL())
      .paginate(page, DEFAULT_PAGE_LIMIT)
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(TripValidator)

    const driverAlreadyBooked = await Trip.query()
      .where('driver_id', auth.user!.id)
      .where('departure_datetime', payload.departure_datetime.toString())
      .first()

    if (driverAlreadyBooked) {
      return response.status(400).send({ message: 'Driver already booked' })
    }

    const { departureLocationId, arrivalLocationId } = await this.getOrCreateLocations(
      payload.departure_location,
      payload.arrival_location
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

    await trip.load('driver')
    await trip.load('departureLocation')
    await trip.load('arrivalLocation')

    return await trip

    // TODO : A faire plus tard pour la création d'un trip
    // TODO : Conducteur ne doit pas être passager sur un autre trajet à la même date
    // TODO : Créer également une conversation et un message de base
  }

  public async update({ request, response, params, bouncer, auth }: HttpContextContract) {
    const trip = await Trip.findOrFail(params.id)

    await bouncer.with('TripPolicy').authorize('update', trip)

    const payload = await request.validate(TripValidator)

    const driverAlreadyBooked = await Trip.query()
      .where('driver_id', auth.user!.id)
      .where('departure_datetime', payload.departure_datetime.toString())
      .whereNot('id', trip.id)
      .first()

    if (driverAlreadyBooked) {
      return response.status(400).send({ message: 'Driver already booked' })
    }

    const { departureLocationId, arrivalLocationId } = await this.getOrCreateLocations(
      payload.departure_location,
      payload.arrival_location
    )

    await trip
      .merge({
        departureLocationId,
        arrivalLocationId,
        departureDatetime: payload.departure_datetime,
        maxPassengers: payload.max_passengers,
        price: payload.price,
        content: payload.content,
      })
      .save()

    await trip.load('driver')
    await trip.load('departureLocation')
    await trip.load('arrivalLocation')

    return trip

    // TODO : A faire plus tard pour la mise à jour d'un trip
    // TODO : Conducteur ne doit pas être passager sur un autre trajet à la même date
    // TODO : Envoyer un email pour prévenir les passagers que le trajet a été modifié par le conducteur
  }

  public async destroy({ params, bouncer, response }: HttpContextContract) {
    const trip = await Trip.findOrFail(params.id)
    await bouncer.with('TripPolicy').authorize('delete', trip)
    await trip.delete()

    return response.status(204)

    // TODO : A faire plus tard pour la mise à jour d'un trip
    // Envoyer un email pour prévenir les passagers que le trajet a été supprimé par le conducteur
  }

  private async getOrCreateLocations(departureLocation: Location, arrivalLocation: Location) {
    const departureLocationId = await LocationService.getLocation(
      departureLocation.name,
      departureLocation.coordinates.longitude,
      departureLocation.coordinates.latitude
    )

    const arrivalLocationId = await LocationService.getLocation(
      arrivalLocation.name,
      arrivalLocation.coordinates.longitude,
      arrivalLocation.coordinates.latitude
    )

    return { departureLocationId, arrivalLocationId }
  }
}
