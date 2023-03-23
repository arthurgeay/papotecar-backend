import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import Trip from 'App/Models/Trip'
import User from 'App/Models/User'
import { uuid } from 'uuidv4'

test.group('Find all messages for a trip', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that user is not authenticated', async ({ client, assert }) => {
    const response = await client.get(`/trips/${uuid()}/messages`)

    assert.equal(response.status(), 401)
  })

  test('it should return that id is not an uuid', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')

    const response = await client.get(`/trips/1/messages`).loginAs(user!)

    assert.equal(response.status(), 422)
    assert.equal(response.body().errors[0].message, "L'identifiant doit être un UUID valide")
  })

  test('it should return all messages for trip', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const trip = await Trip.query().where('driverId', user!.id).first()
    const response = await client.get(`/trips/${trip!.id}/messages`).loginAs(user!)

    assert.equal(response.status(), 200)
    assert.equal(response.body().length, 1)
  })
})
