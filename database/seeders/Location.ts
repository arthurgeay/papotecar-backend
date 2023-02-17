import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Location from 'App/Models/Location'
import LocationFactory from 'Database/factories/LocationFactory'

export default class extends BaseSeeder {
  public async run() {
    await Location.firstOrCreate(
      { name: 'Nantes' },
      {
        name: 'Nantes',
        coordinates: {
          longitude: -1.553621,
          latitude: 47.218371,
        },
      }
    )
  }
}
