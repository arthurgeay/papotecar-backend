import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PusherMessenger from '@ioc:Messenger/Pusher'
import Trip from 'App/Models/Trip'
import MessageValidator from 'App/Validators/MessageValidator'
import UuidParamValidator from 'App/Validators/UuidParamValidator'

export default class MessagesController {
  private async getTrip(
    request: HttpContextContract['request'],
    bouncer: HttpContextContract['bouncer'],
    authorizationMethod: 'view' | 'create'
  ) {
    const { params } = await request.validate(UuidParamValidator)

    const trip = await Trip.findOrFail(params.id)
    await bouncer.with('MessagePolicy').authorize(authorizationMethod, trip)

    return trip
  }

  public async show({ request, bouncer }: HttpContextContract) {
    const trip = await this.getTrip(request, bouncer, 'view')
    await trip.load('messages')

    return trip.messages
  }

  public async store({ request, bouncer, auth, response }: HttpContextContract) {
    const trip = await this.getTrip(request, bouncer, 'create')

    const payload = await request.validate(MessageValidator)

    const message = await trip.related('messages').create({
      ...payload,
      userId: auth.user!.id,
    })

    await message.load('user')

    // TODO : Utiliser l'API de pusher

    await PusherMessenger.trigger(trip.id, 'newMessage', {
      message,
    })

    return response.status(201)
  }
}
