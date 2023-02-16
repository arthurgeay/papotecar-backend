import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'
import LoginUserValidator from 'App/Validators/LoginUserValidator'

export default class AuthController {
  public async register({ auth, request }: HttpContextContract) {
    const payload = await request.validate(CreateUserValidator)
    const user = await User.create(payload)
    const token = await auth.use('api').generate(user, {
      expiresIn: '1 hour',
    })

    return token
  }

  public async login({ auth, request }: HttpContextContract) {
    const payload = await request.validate(LoginUserValidator)
    const token = await auth
      .use('api')
      .attempt(payload.email, payload.password, { expiresIn: '1 hour' })

    return token
  }

  public async logout({ response, auth }: HttpContextContract) {
    await auth.use('api').revoke()

    return response.status(204)
  }
}
