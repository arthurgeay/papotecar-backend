import Trip from 'App/Models/Trip'

export default class TripsController {
  public async index() {
    return await Trip.query()
      .preload('driver')
      .preload('departureLocation')
      .preload('arrivalLocation')
  }
}
