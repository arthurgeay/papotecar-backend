import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Message from 'App/Models/Message'
import UuidParamValidator from 'App/Validators/UuidParamValidator'

export default class MessagesController {
  public async show({ request }: HttpContextContract) {
    const { params } = await request.validate(UuidParamValidator)

    return await Message.query().preload('user').where('tripId', params.id)
  }
}
