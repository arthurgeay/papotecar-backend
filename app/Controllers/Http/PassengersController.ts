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

  public async approve({ request, params, bouncer }: HttpContextContract) {
    await request.validate(UuidParamValidator)

    const trip = await Trip.query()
      .where('id', params.id)
      .whereHas('passengers', (query) => {
        query.where('user_id', params.passengerId)
      })
      .firstOrFail()

    await bouncer.with('PassengerPolicy').authorize('update', trip)

    await trip.related('passengers').pivotQuery().where('user_id', params.passengerId).update({
      is_approve: true,
    })

    await trip.load('arrivalLocation')
    await trip.load('departureLocation')
    await trip.load('driver')
    await trip.load('passengers')

    // TODO : Pour plus tard :
    // TODO : Envoyer un mail pour notifier l'utilisateur de l'approbation

    return trip
  }

  // TODO : Faire la méthode de refus
  // TODO : Implémenter les tests pour la méthode d'approbation et de refus
  // TODO : Faire la documentation

  public async destroy({ request, params, response, auth, bouncer }: HttpContextContract) {
    await request.validate(UuidParamValidator)
    const trip = await Trip.findOrFail(params.id)

    await bouncer.with('PassengerPolicy').authorize('unregister', trip, params.passengerId)

    await trip.related('passengers').detach([params.passengerId])

    return response.status(204)
  }
}
