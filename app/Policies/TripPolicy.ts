import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import Trip from 'App/Models/Trip'
import User from 'App/Models/User'

export default class TripPolicy extends BasePolicy {
  public async update(user: User, trip: Trip) {
    return user.id === trip.driverId
  }

  public async delete(user: User, trip: Trip) {
    return user.id === trip.driverId
  }
}
