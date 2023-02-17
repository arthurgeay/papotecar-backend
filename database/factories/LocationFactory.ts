import Location from 'App/Models/Location'
import Factory from '@ioc:Adonis/Lucid/Factory'

export default Factory.define(Location, ({ faker }) => {
  return {
    name: faker.address.city(),
    coordinates: {
      longitude: parseFloat(faker.address.longitude()),
      latitude: parseFloat(faker.address.latitude()),
    },
  }
}).build()
