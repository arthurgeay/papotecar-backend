import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import User from 'App/Models/User'

test.group('Get information from authenticated user', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that user is not authenticated', async ({ client, assert }) => {
    const response = await client.get('/me')

    assert.equal(response.status(), 401)
  })

  test('it should return user information', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const response = await client.get('/me').loginAs(user!)

    assert.equal(response.status(), 200)
    assert.equal(response.body().id, user!.id)
    assert.equal(response.body().fullname, user!.fullname)
    assert.equal(response.body().email, user!.email)
  })
})
