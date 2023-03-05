import Bouncer, { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
import Trip from 'App/Models/Trip'

export default class PassengerPolicy extends BasePolicy {
  public async register(user: User, trip: Trip) {
    if (user.id !== trip.driverId) {
      return true
    }

    return Bouncer.deny('You cannot register for your own trip')
  }
}
