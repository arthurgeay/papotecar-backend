import { TripService } from './../../Services/TripService'
import { PassengerService } from './../../Services/PassengerService'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Trip from 'App/Models/Trip'
import UuidParamValidator from 'App/Validators/UuidParamValidator'
import { DateTime } from 'luxon'
import MailerService from 'App/Services/MailerService'
import User from 'App/Models/User'

export default class PassengersController {
  public async store({ request, bouncer, auth, response }: HttpContextContract) {
    const payload = await request.validate(UuidParamValidator)
    const trip = await Trip.findOrFail(payload.params.id)

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

  public async destroy({ request, response, bouncer }: HttpContextContract) {
    const payload = await request.validate(UuidParamValidator)
    const trip = await Trip.findOrFail(payload.params.id)

    await bouncer.with('PassengerPolicy').authorize('unregister', trip, payload.params.passengerId!)

    await trip.related('passengers').detach([payload.params.passengerId!])

    return response.status(204)
  }

  public async approve(ctx: HttpContextContract) {
    const trip = await PassengerService.updatePassengerStatus(ctx, true)

    const passenger = await User.find(ctx.params.passengerId!)

    await MailerService.sendMail(
      trip,
      passenger!,
      'emails/passenger_validation',
      'Votre inscription au trajet a été validée',
      { isValidate: true }
    )

    return ctx.response.status(204)
  }

  public async disapprove(ctx: HttpContextContract) {
    const trip = await PassengerService.updatePassengerStatus(ctx, false)

    const passenger = await User.find(ctx.params.passengerId!)

    await MailerService.sendMail(
      trip,
      passenger!,
      'emails/passenger_validation',
      'Votre inscription au trajet a été refusée',
      { isValidate: false }
    )

    return ctx.response.status(204)
  }
}
