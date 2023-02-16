import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LoginUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({ trim: true }, [rules.email()]),
    password: schema.string(),
  })

  public messages: CustomMessages = {
    'email.required': "L'email est requis",
    'email.email': "L'email n'est pas valide",
    'password.required': 'Le mot de passe est requis',
  }
}
