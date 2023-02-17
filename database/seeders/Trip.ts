import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import TripFactory from 'Database/factories/TripFactory'

export default class extends BaseSeeder {
  public async run() {
    await TripFactory.with('driver')
      .with('departureLocation')
      .with('arrivalLocation')
      .createMany(10)
  }
}
