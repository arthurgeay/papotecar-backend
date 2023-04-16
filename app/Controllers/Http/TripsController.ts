import { TripService } from './../../Services/TripService'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Trip from 'App/Models/Trip'
import TripValidator from 'App/Validators/TripValidator'
import LocationService from 'App/Services/LocationService'
import UuidParamValidator from 'App/Validators/UuidParamValidator'
import SearchValidator from 'App/Validators/SearchValidator'
import Message from 'App/Models/Message'
import MailerService from 'App/Services/MailerService'

export default class TripsController {
  public async index({ request }: HttpContextContract) {
    const payload = await request.validate(SearchValidator)
    const DEFAULT_PAGE_LIMIT = 10

    return await Trip.query()
      .preload('driver')
      .preload('departureLocation')
      .preload('arrivalLocation')
      .preload('passengers')
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

    await MailerService.sendMailForPassengers(
      trip,
      'emails/updated_trip',
      'Modification de votre trajet'
    )

    return trip
  }

  public async destroy({ request, bouncer, response }: HttpContextContract) {
    const payload = await request.validate(UuidParamValidator)

    const trip = await Trip.findOrFail(payload.params.id)
    await bouncer.with('TripPolicy').authorize('delete', trip)

    await trip.load('departureLocation')
    await trip.load('arrivalLocation')

    const passengers = await trip.related('passengers').query()

    await trip.delete()

    await MailerService.sendMailForPassengers(
      trip,
      'emails/deleted_trip',
      'Suppression de votre trajet',
      passengers
    )

    return response.status(204)
  }
}
