import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UsersController {
  public async show({ auth }: HttpContextContract) {
    return auth.user
  }
}
