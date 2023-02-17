import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import User from 'App/Models/User'

test.group('Find all trips', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return all trips', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const response = await client.get('/trips').loginAs(user!)

    assert.equal(response.status(), 200)
    assert.exists(response.body().data)
    assert.exists(response.body().meta)
    assert.equal(response.body().data.length, 10)
  })
})
