import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'

export default class AuthController {
  public async register({ auth, request }: HttpContextContract) {
    const payload = await request.validate(CreateUserValidator)
    const user = await User.create(payload)
    const token = await auth.use('api').generate(user)

    return token
  }
}
