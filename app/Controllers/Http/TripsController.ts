import { TripService } from './../../Services/TripService'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Trip from 'App/Models/Trip'
import TripValidator from 'App/Validators/TripValidator'
import LocationService from 'App/Services/LocationService'
import UuidParamValidator from 'App/Validators/UuidParamValidator'
import SearchValidator from 'App/Validators/SearchValidator'
import Message from 'App/Models/Message'

export default class TripsController {
  public async index({ request }: HttpContextContract) {
    const payload = await request.validate(SearchValidator)
    const DEFAULT_PAGE_LIMIT = 10

    return await Trip.query()
      .preload('driver')
      .preload('departureLocation')
      .preload('arrivalLocation')
      .whereHas('departureLocation', (query) => {
        query.where('name', payload.departure_location)
      })
      .whereHas('arrivalLocation', (query) => {
        query.where('name', payload.arrival_location)
      })
      .where('maxPassengers', '>=', payload.max_passengers)
      .where('departureDatetime', '>=', payload.departure_datetime.toSQL())
      .paginate(payload.page || 1, DEFAULT_PAGE_LIMIT)
  }

  public async show({ params }: HttpContextContract) {
    return await Trip.query()
      .preload('arrivalLocation')
      .preload('departureLocation')
      .preload('driver')
      .preload('passengers')
      .where('id', params.id)
      .firstOrFail()
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

    await Message.create({
      tripId: trip.id,
      userId: auth.user?.id,
      content: `Bonjour, je suis le conducteur de ce trajet. Si vous avez des questions, n'hésitez pas à me contacter.`,
    })

    await trip.load('driver')
    await trip.load('departureLocation')
    await trip.load('arrivalLocation')
    await trip.load('passengers')

    return await trip
  }

  public async update({ request, bouncer, auth }: HttpContextContract) {
    const { params } = await request.validate(UuidParamValidator)

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

  public async destroy({ request, bouncer, response }: HttpContextContract) {
    const payload = await request.validate(UuidParamValidator)

    const trip = await Trip.findOrFail(payload.params.id)
    await bouncer.with('TripPolicy').authorize('delete', trip)
    await trip.delete()

    return response.status(204)

    // TODO : A faire plus tard pour la mise à jour d'un trip
    // Envoyer un email pour prévenir les passagers que le trajet a été supprimé par le conducteur
  }
}
