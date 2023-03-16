import Bouncer, { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
import Trip from 'App/Models/Trip'

export default class PassengerPolicy extends BasePolicy {
  public async register(user: User, trip: Trip) {
    await trip.loadCount('passengers')

    if (user.id !== trip.driverId && trip.$extras.passengers_count < trip.maxPassengers) {
      return true
    }

    return Bouncer.deny('You cannot register for your own trip or the trip is full')
  }

  public async unregister(user: User, trip: Trip, passengerId: string) {
    const isPassenger = await trip.related('passengers').query().where('user_id', user.id).first()

    if (user.id !== trip.driverId && user.id === passengerId && isPassenger) {
      return true
    }

    return Bouncer.deny('You cannot unregister for another passenger')
  }

  public async update(user: User, trip: Trip) {
    if (user.id === trip.driverId) {
      return true
    }

    return Bouncer.deny('You cannot update a passenger status')
  }
}
