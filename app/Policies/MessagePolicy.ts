import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
import Bouncer from '@ioc:Adonis/Addons/Bouncer'
import Trip from 'App/Models/Trip'

export default class MessagePolicy extends BasePolicy {
  public async view(user: User, trip: Trip) {
    const isPassengerOrDriver = await this.isPassengerOrDriver(trip, user)
    if (isPassengerOrDriver) {
      return true
    }

    return Bouncer.deny('You cannot view messages for a trip you are not a part of')
  }

  public async create(user: User, trip: Trip) {
    const isPassengerOrDriver = await this.isPassengerOrDriver(trip, user)
    if (isPassengerOrDriver) {
      return true
    }

    return Bouncer.deny('You cannot create messages for a trip you are not a part of')
  }

  private async isPassengerOrDriver(trip: Trip, user: User) {
    await trip.load('passengers')

    if (
      trip.driverId === user.id ||
      trip.passengers.some((passenger) => passenger.id === user.id)
    ) {
      return true
    }

    return false
  }
}
