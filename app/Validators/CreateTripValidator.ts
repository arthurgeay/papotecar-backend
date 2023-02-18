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

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {}
}
