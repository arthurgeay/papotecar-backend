import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Location from 'App/Models/Location'

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

    await Location.firstOrCreate(
      { name: 'Paris' },
      {
        name: 'Paris',
        coordinates: {
          longitude: -1,
          latitude: 12,
        },
      }
    )
  }
}
