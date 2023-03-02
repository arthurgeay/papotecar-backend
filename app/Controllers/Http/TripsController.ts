import { TripService } from './../../Services/TripService'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Trip from 'App/Models/Trip'
import TripValidator from 'App/Validators/TripValidator'
import LocationService from 'App/Services/LocationService'

const DEFAULT_PAGE_LIMIT = 10

export default class TripsController {
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)

    return await Trip.query()
      .preload('driver')
      .preload('departureLocation')
      .preload('arrivalLocation')
      .preload('passengers')
      .paginate(page, DEFAULT_PAGE_LIMIT)
  }

  public async store({ request, auth }: HttpContextContract) {
    const payload = await request.validate(TripValidator)

    await TripService.isDriverOrPassengerAlreadyBooked(auth.user!, payload.departure_datetime)

    const { departureLocationId, arrivalLocationId } = await LocationService.getOrCreateLocations(
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
    await trip.load('passengers')

    return await trip

    // TODO : A faire plus tard pour la création d'un trip
    // TODO : Créer également une conversation et un message de base
  }

  public async update({ request, params, bouncer, auth }: HttpContextContract) {
    const trip = await Trip.findOrFail(params.id)

    await bouncer.with('TripPolicy').authorize('update', trip)

    const payload = await request.validate(TripValidator)

    await TripService.isDriverOrPassengerAlreadyBooked(auth.user!, payload.departure_datetime, trip)

    const { departureLocationId, arrivalLocationId } = await LocationService.getOrCreateLocations(
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
    await trip.load('passengers')

    return trip

    // TODO : A faire plus tard pour la mise à jour d'un trip
    // TODO : Envoyer un email pour prévenir les passagers que le trajet a été modifié par le conducteur
  }

  public async destroy({ params, bouncer, response }: HttpContextContract) {
    const trip = await Trip.findOrFail(params.id)
    await bouncer.with('TripPolicy').authorize('delete', trip)
    await trip.delete()

    // TODO : Supprimer les passagers

    return response.status(204)

    // TODO : A faire plus tard pour la mise à jour d'un trip
    // Envoyer un email pour prévenir les passagers que le trajet a été supprimé par le conducteur
  }
}
