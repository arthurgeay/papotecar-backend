import { TripService } from './../../Services/TripService'
import { PassengerService } from './../../Services/PassengerService'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Trip from 'App/Models/Trip'
import UuidParamValidator from 'App/Validators/UuidParamValidator'
import { DateTime } from 'luxon'

export default class PassengersController {
  public async store({ request, params, bouncer, auth, response }: HttpContextContract) {
    await request.validate(UuidParamValidator)
    const trip = await Trip.findOrFail(params.id)

    await bouncer.with('PassengerPolicy').authorize('register', trip)
    await PassengerService.isAlreadyRegistered(trip, auth.user!)
    await TripService.isDriverOrPassengerAlreadyBooked(
      auth.user!,
      DateTime.fromJSDate(new Date(trip.departureDatetime.toString())),
      trip
    )

    await trip.related('passengers').attach([auth.user!.id])

    await trip.load('passengers')
    await trip.load('driver')
    await trip.load('departureLocation')
    await trip.load('arrivalLocation')

    return response.send(trip)
  }

  public async destroy({ request, params, response, auth, bouncer }: HttpContextContract) {
    await request.validate(UuidParamValidator)
    const trip = await Trip.findOrFail(params.id)

    await bouncer.with('PassengerPolicy').authorize('unregister', trip, params.passengerId)

    await trip.related('passengers').detach([params.passengerId])

    return response.status(204)
  }
}
