import Message from 'App/Models/Message'
import Factory from '@ioc:Adonis/Lucid/Factory'
import UserFactory from './UserFactory'
import TripFactory from './TripFactory'

export default Factory.define(Message, ({ faker }) => {
  return {
    content: faker.lorem.sentence(),
  }
})
  .relation('user', () => UserFactory)
  .relation('trip', () => TripFactory)
  .build()
