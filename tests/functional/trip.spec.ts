import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

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

test.group('Create trip', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should validation failed')
    .with([
      {
        data: {},
        errors: [
          {
            rule: 'required',
            field: 'departure_location',
            message: 'Le lieu de départ est requis',
          },
          {
            rule: 'required',
            field: 'arrival_location',
            message: 'Le lieu d’arrivée est requis',
          },
          {
            rule: 'required',
            field: 'departure_datetime',
            message: 'La date de départ est requise',
          },
          {
            rule: 'required',
            field: 'max_passengers',
            message: 'Le nombre de passagers est requis',
          },
          {
            rule: 'required',
            field: 'price',
            message: 'Le prix est requis',
          },
        ],
      },
      {
        data: {
          departure_location: {
            name: 'Passaic',
            longitude: -153.2613,
            latitude: 19.581,
          },
          arrival_location: {
            name: 'Test',
            longitude: -1,
            latitude: 2,
          },
          departure_datetime: 'Not a date',
          max_passengers: 'Not a number',
          price: 'Not a number',
          content: 1,
        },
        errors: [
          {
            rule: 'date.format',
            field: 'departure_datetime',
            message: 'La date de départ doit être une date valide',
            args: {},
          },
          {
            rule: 'number',
            field: 'max_passengers',
            message: 'Le nombre de passagers doit être un nombre',
          },
          {
            rule: 'number',
            field: 'price',
            message: 'Le prix doit être un nombre',
          },
          {
            rule: 'string',
            field: 'content',
            message: 'Le contenu doit être une chaîne de caractères',
          },
        ],
      },
      {
        data: {
          departure_location: {
            name: 'Passaic',
            longitude: -153.2613,
            latitude: 19.581,
          },
          arrival_location: {
            name: 'Passaic',
            longitude: -153.2613,
            latitude: 19.581,
          },
          departure_datetime: '2019-01-01',
          max_passengers: -1,
          price: 1000,
          content: null,
        },
        errors: [
          {
            rule: 'uniqueGpsCoordinates',
            field: 'departure_location',
            message: 'Le lieu de départ doit être différent du lieu d’arrivée',
          },
          {
            rule: 'uniqueGpsCoordinates',
            field: 'arrival_location',
            message: 'Le lieu d’arrivée doit être différent du lieu de départ',
          },
          {
            rule: 'afterOrEqual',
            field: 'departure_datetime',
            message: 'La date de départ doit être supérieure ou égale à la date actuelle',
            args: {
              afterOrEqual: new Date().toISOString(),
            },
          },
          {
            rule: 'range',
            field: 'max_passengers',
            message: 'Le nombre de passagers doit être compris entre 1 et 4',
            args: {
              start: 1,
              stop: 4,
            },
          },
          {
            rule: 'range',
            field: 'price',
            message: 'Le prix doit être compris entre 1 et 100',
            args: {
              start: 1,
              stop: 100,
            },
          },
        ],
      },
    ])
    .run(async ({ client, assert }, row) => {
      const user = await User.findBy('email', 'test@papotecar.com')

      const response = await client.post('/trips').loginAs(user!).json(row.data)

      assert.equal(response.status(), 422)
      assert.exists(response.body().errors)

      if (row.data?.departure_datetime === '2019-01-01') {
        row.errors[2].args.afterOrEqual = response.body().errors[2].args.afterOrEqual
        return
      }

      assert.deepEqual(response.body().errors, row.errors)
    })

  test('it should return that driver is booked', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const date = new Date()
    date.setHours(0, 0, 0, 0)

    const response = await client
      .post('/trips')
      .loginAs(user!)
      .json({
        departure_location: {
          name: 'Passaic',
          longitude: -153.2613,
          latitude: 19.581,
        },
        arrival_location: {
          name: 'Paris',
          longitude: -1,
          latitude: 12,
        },
        departure_datetime: DateTime.fromJSDate(date),
        max_passengers: 2,
        price: 100,
        content: null,
      })

    assert.equal(response.status(), 400)
    assert.equal(response.body().message, 'Driver already booked')
  })

  test('it should create trip', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const response = await client
      .post('/trips')
      .loginAs(user!)
      .json({
        departure_location: {
          name: 'Passaic',
          longitude: -153.2613,
          latitude: 19.581,
        },
        arrival_location: {
          name: 'Paris',
          longitude: -1,
          latitude: 12,
        },
        departure_datetime: DateTime.now(),
        max_passengers: 2,
        price: 100,
        content: 'My description',
      })

    assert.equal(response.status(), 200)
    assert.exists(response.body().id)
    assert.exists(response.body().departure_location)
    assert.exists(response.body().arrival_location)
    assert.exists(response.body().departure_datetime)
    assert.exists(response.body().max_passengers)
    assert.exists(response.body().price)
    assert.exists(response.body().content)
    assert.exists(response.body().driver)
  })
})
