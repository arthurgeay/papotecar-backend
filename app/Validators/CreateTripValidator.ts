import { Point } from './../Models/Location'
import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateTripValidator {
  constructor(protected ctx: HttpContextContract) {}

  public refs = schema.refs<{ departureLocationSelected: Point; arrivalLocationSelected: Point }>({
    departureLocationSelected: this.ctx.request.input('departure_location'),
    arrivalLocationSelected: this.ctx.request.input('arrival_location'),
  })

  public schema = schema.create({
    departure_location: schema
      .object([rules.uniqueGpsCoordinates(this.refs.arrivalLocationSelected as unknown as Point)])
      .members({
        name: schema.string(),
        longitude: schema.number(),
        latitude: schema.number(),
      }),
    arrival_location: schema
      .object([rules.uniqueGpsCoordinates(this.refs.departureLocationSelected as unknown as Point)])
      .members({
        name: schema.string(),
        longitude: schema.number(),
        latitude: schema.number(),
      }),
    departure_datetime: schema.date({}, [rules.afterOrEqual('today')]),
    max_passengers: schema.number([rules.range(1, 4)]),
    price: schema.number([rules.range(1, 100)]),
    content: schema.string.optional(),
  })

  public messages: CustomMessages = {
    'departure_location.required': 'Le lieu de départ est requis',
    'departure_location.uniqueGpsCoordinates':
      'Le lieu de départ doit être différent du lieu d’arrivée',
    'arrival_location.required': 'Le lieu d’arrivée est requis',
    'arrival_location.uniqueGpsCoordinates':
      'Le lieu d’arrivée doit être différent du lieu de départ',
    'departure_datetime.required': 'La date de départ est requise',
    'departure_datetime.afterOrEqual':
      'La date de départ doit être supérieure ou égale à la date actuelle',
    'departure_datetime.date.format': 'La date de départ doit être une date valide',
    'max_passengers.required': 'Le nombre de passagers est requis',
    'max_passengers.number': 'Le nombre de passagers doit être un nombre',
    'max_passengers.range':
      'Le nombre de passagers doit être compris entre {{ options.start }} et {{ options.stop }}',
    'price.required': 'Le prix est requis',
    'price.number': 'Le prix doit être un nombre',
    'price.range': 'Le prix doit être compris entre {{ options.start }} et {{ options.stop }}',
    'content.string': 'Le contenu doit être une chaîne de caractères',
  }
}
