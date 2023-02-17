import Trip from 'App/Models/Trip'
import Factory from '@ioc:Adonis/Lucid/Factory'
import LocationFactory from './LocationFactory'
import UserFactory from './UserFactory'

export default Factory.define(Trip, ({ faker }) => {
  return {
    departureDatetime: faker.date.future(),
    maxPassengers: faker.datatype.number({ min: 1, max: 4 }),
    price: faker.datatype.number({ min: 1, max: 100 }),
    content: faker.lorem.paragraph(),
  }
})
  .relation('driver', () => UserFactory)
  .relation('departureLocation', () => LocationFactory)
  .relation('arrivalLocation', () => LocationFactory)
  .build()
