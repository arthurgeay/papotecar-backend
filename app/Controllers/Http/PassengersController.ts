import { TripService } from './../../Services/TripService'
import { PassengerService } from './../../Services/PassengerService'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Trip from 'App/Models/Trip'
import UuidParamValidator from 'App/Validators/UuidParamValidator'
import { DateTime } from 'luxon'

export default class PassengersController {
  public async store({ request, params, bouncer, auth, response }: HttpContextContract) {
    await request.validate(UuidParamValidator)
    // TODO : Vérifier que le voyage existe
    const trip = await Trip.findOrFail(params.id)

    // TODO : Vérifier que l'utilisateur connecté n'est pas le créateur du voyage
    await bouncer.with('PassengerPolicy').authorize('register', trip)

    // TODO : Vérifier que l'utilisateur connecté n'est pas déjà inscrit à ce voyage
    await PassengerService.isAlreadyRegistered(trip, auth.user!)

    // TODO : Vérifier que l'utilisateur n'est pas passager ou conducteur sur un autre voyage au même moment
    await TripService.isDriverOrPassengerAlreadyBooked(
      auth.user!,
      DateTime.fromJSDate(new Date(trip.departureDatetime.toString())),
      trip
    )

    // TODO : Enregistrer la demande de passager pour le voyage
    await trip.related('passengers').attach([auth.user!.id])

    await trip.load('passengers')
    await trip.load('driver')
    await trip.load('departureLocation')
    await trip.load('arrivalLocation')

    return response.send(trip)

    // TODO : Faire les tests
    // TODO : Mettre la doc à jour
  }
}
