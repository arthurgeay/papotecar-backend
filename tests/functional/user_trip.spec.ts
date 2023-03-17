import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import User from 'App/Models/User'

test.group('Find all trips', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that user is not authenticated', async ({ client, assert }) => {
    const response = await client.get('/me/trips')

    assert.equal(response.status(), 401)
  })

  test('it should return all trips as passenger and as driver', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')

    const response = await client.get('/me/trips').loginAs(user!)

    assert.exists(response.body().tripsAsDriver)
    assert.exists(response.body().tripsAsPassenger)
    assert.isArray(response.body().tripsAsDriver)
    assert.isArray(response.body().tripsAsPassenger)
  })
})
