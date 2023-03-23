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

  test('it should return trip does not exist', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const response = await client.get(`/trips/${uuid()}/messages`).loginAs(user!)

    assert.equal(response.status(), 404)
  })

  test('it should return that user can not view messages for this trip', async ({
    client,
    assert,
  }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const trip = await Trip.first()
    const response = await client.get(`/trips/${trip!.id}/messages`).loginAs(user!)

    assert.equal(response.status(), 403)
    assert.equal(
      response.body().message,
      'E_AUTHORIZATION_FAILURE: You cannot view messages for a trip you are not a part of'
    )
  })

  test('it should return all messages for trip', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const trip = await Trip.query().where('driverId', user!.id).first()
    const response = await client.get(`/trips/${trip!.id}/messages`).loginAs(user!)

    assert.equal(response.status(), 200)
    assert.equal(response.body().length, 1)
  })
})

test.group('Create a message', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that user is not authenticated', async ({ client, assert }) => {
    const response = await client.post(`/trips/${uuid()}/messages`)

    assert.equal(response.status(), 401)
  })

  test('it should return that id is not an uuid', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')

    const response = await client.post(`/trips/1/messages`).loginAs(user!)

    assert.equal(response.status(), 422)
    assert.equal(response.body().errors[0].message, "L'identifiant doit être un UUID valide")
  })

  test('it should return trip does not exist', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const response = await client.post(`/trips/${uuid()}/messages`).loginAs(user!)

    assert.equal(response.status(), 404)
  })

  test('it should return that user can not post message for this trip', async ({
    client,
    assert,
  }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const trip = await Trip.first()
    const response = await client.post(`/trips/${trip!.id}/messages`).loginAs(user!)

    assert.equal(response.status(), 403)
    assert.equal(
      response.body().message,
      'E_AUTHORIZATION_FAILURE: You cannot create messages for a trip you are not a part of'
    )
  })

  test('it should return that content message is required', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const trip = await Trip.query().where('driverId', user!.id).first()
    const response = await client.post(`/trips/${trip!.id}/messages`).loginAs(user!)

    assert.equal(response.status(), 422)
    assert.equal(response.body().errors[0].message, 'Le contenu du message est requis')
  })

  test('it should create new message', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const trip = await Trip.query().where('driverId', user!.id).first()
    const response = await client.post(`/trips/${trip!.id}/messages`).loginAs(user!).json({
      content: 'Hello',
    })

    assert.equal(response.status(), 201)
  })
})
