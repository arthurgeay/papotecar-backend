import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    fullname: schema.string({ trim: true }, [rules.minLength(3), rules.maxLength(255)]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email' }),
    ]),
    password: schema.string({}, [rules.minLength(8), rules.maxLength(255)]),
  })

  public messages: CustomMessages = {
    'fullname.required': 'Le nom complet est requis',
    'email.required': "L'email est requis",
    'email.unique': 'Cet email est déjà utilisé',
    'password.required': 'Le mot de passe est requis',
    'email.email': "L'email n'est pas valide",
    'password.minLength': 'Le mot de passe doit contenir au moins 8 caractères',
    'fullname.minLength': 'Le nom complet doit contenir au moins 3 caractères',
  }
}
