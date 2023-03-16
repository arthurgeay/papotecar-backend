import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Location from 'App/Models/Location'
import Trip from 'App/Models/Trip'
import User from 'App/Models/User'
import TripFactory from 'Database/factories/TripFactory'
import UserFactory from 'Database/factories/UserFactory'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  public async run() {
    await TripFactory.with('driver')
      .with('departureLocation')
      .with('arrivalLocation')
      .with('passengers', 3, (passenger) => {
        passenger.pivotAttributes([
          { is_approve: true },
          { is_approve: false },
          { is_approve: true },
        ])
      })
      .merge({
        maxPassengers: 4,
      })
      .createMany(10)

    const user = await User.findBy('email', 'test@papotecar.com')
    const userHaveTrip = await Trip.query().where('driverId', user!.id)

    // Create a trip for the user if he doesn't have one
    if (userHaveTrip.length === 0) {
      const departureLocation = await Location.findBy('name', 'Nantes')
      const arrivalLocation = await Location.findBy('name', 'Paris')
      const date = new Date()
      date.setHours(10, 30, 0, 0)

      const firstTrip = await TripFactory.merge({
        departureLocationId: departureLocation!.id,
        arrivalLocationId: arrivalLocation!.id,
        driverId: user!.id,
        departureDatetime: DateTime.fromJSDate(date),
      }).create()

      const passenger = await UserFactory.create()
      await firstTrip.related('passengers').attach([passenger.id])

      const otherDate = new Date('2026-09-01')
      otherDate.setHours(10, 30, 0, 0)

      await TripFactory.merge({
        departureLocationId: departureLocation!.id,
        arrivalLocationId: arrivalLocation!.id,
        driverId: user!.id,
        departureDatetime: DateTime.fromJSDate(otherDate),
      }).create()

      const driver = await UserFactory.create()
      const dateWithPassenger = new Date('2027-09-01')
      dateWithPassenger.setHours(10, 30, 0, 0)

      const tripWithPassenger = await TripFactory.merge({
        departureLocationId: departureLocation!.id,
        arrivalLocationId: arrivalLocation!.id,
        driverId: driver.id,
        departureDatetime: DateTime.fromJSDate(dateWithPassenger),
        maxPassengers: 4,
      }).create()

      await tripWithPassenger.related('passengers').attach([user!.id])

      await TripFactory.merge({
        departureLocationId: departureLocation!.id,
        arrivalLocationId: arrivalLocation!.id,
        driverId: driver.id,
        departureDatetime: DateTime.fromJSDate(date),
      }).create()

      const anotherDriver = await UserFactory.create()
      await TripFactory.merge({
        departureLocationId: departureLocation!.id,
        arrivalLocationId: arrivalLocation!.id,
        driverId: anotherDriver.id,
        departureDatetime: DateTime.fromJSDate(dateWithPassenger),
        maxPassengers: 2,
      }).create()

      await TripFactory.with('driver')
        .with('departureLocation')
        .with('arrivalLocation')
        .with('passengers', 4, (passenger) => {
          passenger.pivotAttributes([
            { is_approve: true },
            { is_approve: true },
            { is_approve: true },
            { is_approve: true },
          ])
        })
        .merge({
          departureDatetime: DateTime.fromJSDate(new Date()),
          maxPassengers: 4,
        })
        .create()
    }
  }
}
