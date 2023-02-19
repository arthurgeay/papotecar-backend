import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import Trip from 'App/Models/Trip'
import User from 'App/Models/User'
import { DateTime } from 'luxon'
import { uuid } from 'uuidv4'

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
            coordinates: {
              longitude: -153.2613,
              latitude: 19.581,
            },
          },
          arrival_location: {
            name: 'Test',
            coordinates: {
              longitude: -1,
              latitude: 2,
            },
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
            coordiantes: {
              longitude: -153.2613,
              latitude: 19.581,
            },
          },
          arrival_location: {
            name: 'Passaic',
            coordinates: {
              longitude: -153.2613,
              latitude: 19.581,
            },
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
          coordinates: {
            longitude: -153.2613,
            latitude: 19.581,
          },
        },
        arrival_location: {
          name: 'Paris',
          coordinates: {
            longitude: -1,
            latitude: 12,
          },
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
          coordinates: {
            longitude: -153.2613,
            latitude: 19.581,
          },
        },
        arrival_location: {
          name: 'Paris',
          coordinates: {
            longitude: -1,
            latitude: 12,
          },
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

test.group('Update trip', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that trip does not exist', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const response = await client.put(`/trips/${uuid()}`).loginAs(user!).json({})

    assert.equal(response.status(), 404)
  })

  test('it should return that user not allowed to update the trip', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const trip = await Trip.query().whereNot('driver_id', user!.id).first()

    const response = await client.put(`/trips/${trip!.id}`).loginAs(user!).json({})

    assert.equal(response.status(), 403)
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
            coordinates: {
              longitude: -153.2613,
              latitude: 19.581,
            },
          },
          arrival_location: {
            name: 'Test',
            coordinates: {
              longitude: -1,
              latitude: 2,
            },
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
            coordiantes: {
              longitude: -153.2613,
              latitude: 19.581,
            },
          },
          arrival_location: {
            name: 'Passaic',
            coordinates: {
              longitude: -153.2613,
              latitude: 19.581,
            },
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
      const trip = await Trip.query().where('driverId', user!.id).first()

      const response = await client.put(`/trips/${trip!.id}`).loginAs(user!).json(row.data)

      assert.equal(response.status(), 422)
      assert.exists(response.body().errors)

      if (row.data?.departure_datetime === '2019-01-01') {
        row.errors[2].args.afterOrEqual = response.body().errors[2].args.afterOrEqual
        return
      }

      assert.deepEqual(response.body().errors, row.errors)
    })

  test('it should return that driver is already booked for another trip', async ({
    client,
    assert,
  }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const date = new Date()
    date.setHours(0, 0, 0, 0)

    const trip = await Trip.query()
      .where('driver_id', user!.id)
      .where('departure_datetime', date)
      .first()

    const newDate = new Date('2026-01-01')
    newDate.setHours(0, 0, 0, 0)

    const response = await client
      .put(`/trips/${trip!.id}`)
      .loginAs(user!)
      .json({
        departure_location: {
          name: 'Marseille',
          coordinates: {
            longitude: -12,
            latitude: 56,
          },
        },
        arrival_location: {
          name: 'Lille',
          coordinates: {
            longitude: -20,
            latitude: 32,
          },
        },
        departure_datetime: DateTime.fromJSDate(newDate),
        max_passengers: 2,
        price: 100,
        content: null,
      })

    assert.equal(response.status(), 400)
    assert.equal(response.body().message, 'Driver already booked')
  })

  test('it should return that trip is updated', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')

    const trip = await Trip.query().where('driver_id', user!.id).first()

    const response = await client
      .put(`/trips/${trip!.id}`)
      .loginAs(user!)
      .json({
        departure_location: {
          name: 'Marseille',
          coordinates: {
            longitude: -12,
            latitude: 56,
          },
        },
        arrival_location: {
          name: 'Lille',
          coordinates: {
            longitude: -20,
            latitude: 32,
          },
        },
        departure_datetime: trip?.departureDatetime,
        max_passengers: trip?.maxPassengers,
        price: trip?.price,
        content: 'Updated content',
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

    assert.equal(response.body().content, 'Updated content')
    assert.equal(response.body().departure_location.name, 'Marseille')
    assert.deepEqual(response.body().departure_location.coordinates, {
      longitude: -12,
      latitude: 56,
    })
    assert.equal(response.body().arrival_location.name, 'Lille')
    assert.deepEqual(response.body().arrival_location.coordinates, {
      longitude: -20,
      latitude: 32,
    })
  })
})
