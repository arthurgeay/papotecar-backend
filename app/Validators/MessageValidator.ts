import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class MessageValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    content: schema.string({ trim: true }),
  })

  public messages: CustomMessages = {
    'content.required': 'Le contenu du message est requis',
  }
}
