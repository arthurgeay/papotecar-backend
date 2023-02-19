import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Location from 'App/Models/Location'
import Trip from 'App/Models/Trip'
import User from 'App/Models/User'
import TripFactory from 'Database/factories/TripFactory'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  public async run() {
    await TripFactory.with('driver')
      .with('departureLocation')
      .with('arrivalLocation')
      .createMany(10)

    const user = await User.findBy('email', 'test@papotecar.com')
    const userHaveTrip = await Trip.query().where('driverId', user!.id)

    // Create a trip for the user if he doesn't have one
    if (userHaveTrip.length === 0) {
      const departureLocation = await Location.findBy('name', 'Nantes')
      const arrivalLocation = await Location.findBy('name', 'Paris')
      const date = new Date()
      date.setHours(0, 0, 0, 0)

      await TripFactory.merge({
        departureLocationId: departureLocation!.id,
        arrivalLocationId: arrivalLocation!.id,
        driverId: user!.id,
        departureDatetime: DateTime.fromJSDate(date),
      }).create()

      const otherDate = new Date('2026-01-01')
      otherDate.setHours(0, 0, 0, 0)

      await TripFactory.merge({
        departureLocationId: departureLocation!.id,
        arrivalLocationId: arrivalLocation!.id,
        driverId: user!.id,
        departureDatetime: DateTime.fromJSDate(otherDate),
      }).create()
    }
  }
}
