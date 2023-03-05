import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import Trip from 'App/Models/Trip'
import User from 'App/Models/User'
import { DateTime } from 'luxon'
import { uuid } from 'uuidv4'

test.group('Register as a passenger on trip', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that user is not authenticated', async ({ client, assert }) => {
    const trip = await Trip.firstOrFail()
    const response = await client.post(`/trips/${trip.id}/passengers`)

    assert.equal(response.status(), 401)
  })

  test('it should return that id is not an uuid', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')

    const response = await client.post(`/trips/1/passengers`).loginAs(user!)

    assert.equal(response.status(), 422)
    assert.equal(response.body().errors[0].message, "L'identifiant doit être un UUID valide")
  })

  test('it should return that trip does not exist', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const response = await client.post(`/trips/${uuid()}/passengers`).loginAs(user!)

    assert.equal(response.status(), 404)
  })

  test('it should return that the user is not allowed to register on trip', async ({
    client,
    assert,
  }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const trip = await Trip.query().where('driver_id', user!.id).firstOrFail()
    const response = await client.post(`/trips/${trip.id}/passengers`).loginAs(user!)

    assert.equal(response.status(), 403)
    assert.equal(
      response.body().message,
      'E_AUTHORIZATION_FAILURE: You cannot register for your own trip'
    )
  })

  test('it should return that the user is already registered for the trip', async ({
    client,
    assert,
  }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const trip = await Trip.query()
      .whereHas('passengers', (query) => {
        query.where('user_id', user!.id)
      })
      .first()
    const response = await client.post(`/trips/${trip!.id}/passengers`).loginAs(user!)

    assert.equal(response.status(), 400)
    assert.equal(
      response.body().message,
      'E_ALREADY_REGISTERED: You are already registered for this trip'
    )
  })

  test('it should return that user is already booked as driver on the same date', async ({
    client,
    assert,
  }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const date = new Date()
    date.setHours(0, 0, 0, 0)

    const trip = await Trip.query()
      .where('departure_datetime', date)
      .whereNot('driver_id', user!.id)
      .first()

    const response = await client.post(`/trips/${trip!.id}/passengers`).loginAs(user!)
    assert.equal(response.status(), 400)
    assert.equal(response.body().message, 'E_DRIVER_ALREADY_BOOKED: Driver already booked')
  })

  test('it should return that user is a passenger in another trip', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')

    const dateWithPassenger = new Date('2027-01-01')
    dateWithPassenger.setHours(0, 0, 0, 0)

    const trip = await Trip.query()
      .leftJoin('passengers', 'passengers.trip_id', 'trips.id')
      .where('departure_datetime', DateTime.fromJSDate(dateWithPassenger).toSQL())
      .whereNull('passengers.user_id')
      .first()

    const response = await client.post(`/trips/${trip!.id}/passengers`).loginAs(user!)

    assert.equal(response.status(), 400)
    assert.equal(
      response.body().message,
      'E_USER_ALREADY_BOOKED: User is a passenger on a trip on the same date'
    )
  })

  test('it should registered the user as a passenger successfully', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')

    const dateWithPassenger = new Date('2027-01-01')
    dateWithPassenger.setHours(0, 0, 0, 0)

    const trip = await Trip.firstOrFail()

    const response = await client.post(`/trips/${trip!.id}/passengers`).loginAs(user!)

    assert.equal(response.status(), 200)
    assert.exists(response.body().departure_location)
    assert.exists(response.body().arrival_location)
    assert.exists(response.body().departure_datetime)
    assert.exists(response.body().max_passengers)
    assert.exists(response.body().price)
    assert.exists(response.body().content)
    assert.exists(response.body().driver)
    assert.exists(response.body().passengers)
  })
})

test.group('Unregister a passenger', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that user is not authenticated', async ({ client, assert }) => {
    const response = await client.delete(`/trips/${uuid()}/passengers/${uuid()}`)

    assert.equal(response.status(), 401)
  })

  test('it should return that id is not an uuid', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')

    const response = await client.delete(`/trips/1/passengers/1`).loginAs(user!)

    assert.equal(response.status(), 422)
    assert.equal(response.body().errors[0].message, "L'identifiant doit être un UUID valide")
    assert.equal(response.body().errors[1].message, "L'identifiant doit être un UUID valide")
  })

  test('it should return that trip does not exist', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const response = await client.post(`/trips/${uuid()}/passengers/${user!.id}`).loginAs(user!)

    assert.equal(response.status(), 404)
  })

  test('it should return that user cannot unregister for another passenger')
    .with([
      {
        data: {
          id: uuid(),
        },
      },
      {
        data: {
          id: null,
        },
      },
    ])
    .run(async ({ client, assert }, row) => {
      const user = await User.findBy('email', 'test@papotecar.com')

      const trip = await Trip.query()
        .leftJoin('passengers', 'passengers.trip_id', 'trips.id')
        .whereNull('passengers.user_id')
        .first()

      const response = await client
        .delete(`/trips/${trip!.id}/passengers/${row.data.id ? row.data.id : user!.id}`)
        .loginAs(user!)

      assert.equal(response.status(), 403)
      console.log(
        response.body().message,
        'E_AUTHORIZATION_FAILURE: You cannot unregister for another passenger'
      )
    })

  test('it should return that user is unregister successfully', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')

    const trip = await Trip.query()
      .whereHas('passengers', (query) => {
        query.where('user_id', user!.id)
      })
      .first()

    const response = await client.delete(`/trips/${trip!.id}/passengers/${user!.id}`).loginAs(user!)

    assert.equal(response.status(), 204)
  })
})
