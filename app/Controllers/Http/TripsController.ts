import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Trip from 'App/Models/Trip'

export default class TripsController {
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = 10

    return await Trip.query()
      .preload('driver')
      .preload('departureLocation')
      .preload('arrivalLocation')
      .paginate(page, limit)
  }
}
