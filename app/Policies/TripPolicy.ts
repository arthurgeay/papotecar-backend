import Bouncer, { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import Trip from 'App/Models/Trip'
import User from 'App/Models/User'

export default class TripPolicy extends BasePolicy {
  public async update(user: User, trip: Trip) {
    if (user.id === trip.driverId) {
      return true
    }

    return Bouncer.deny('You cannot update a trip you are not the driver of')
  }

  public async delete(user: User, trip: Trip) {
    if (user.id === trip.driverId) {
      return true
    }

    return Bouncer.deny('You cannot delete a trip you are not the driver of')
  }
}
