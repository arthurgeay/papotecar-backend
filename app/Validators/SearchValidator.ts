import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SearchValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    page: schema.number.optional(),
    departure_location: schema.string({ trim: true }),
    arrival_location: schema.string({ trim: true }),
    departure_datetime: schema.date({}, [rules.afterOrEqual('today')]),
    max_passengers: schema.number([rules.range(1, 4)]),
  })

  public messages: CustomMessages = {
    'page.number': 'La page doit être un nombre',
    'departure_location.required': 'Le lieu de départ est requis',
    'arrival_location.required': "Le lieu d'arrivée est requis",
    'departure_datetime.afterOrEqual':
      "La date de départ doit être supérieure ou égale à aujourd'hui",
    'max_passengers.required': 'Le nombre de passagers est requis',
    'max_passengers.range': 'Le nombre de passagers doit être compris entre 1 et 4',
    'departure_datetime.required': 'La date de départ est requise',
    'departure_datetime.date.format': 'La date de départ doit être une date valide (ISO format)',
  }
}
