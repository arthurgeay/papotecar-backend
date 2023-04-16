import Mail from '@ioc:Adonis/Addons/Mail'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import Message from 'App/Models/Message'
import Trip from 'App/Models/Trip'
import User from 'App/Models/User'
import { DateTime } from 'luxon'
import { uuid } from 'uuidv4'

test.group('Find all trips', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that user is not authenticated', async ({ client, assert }) => {
    const response = await client.get('/trips')

    assert.equal(response.status(), 401)
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
            message: "Le lieu d'arrivée est requis",
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
        ],
      },
      {
        data: {
          departure_location: 'fake test 1',
          arrival_location: 'fake test 2',
          departure_datetime: new Date('2020-01-01').toString(),
          max_passengers: 10,
        },
        errors: [
          {
            rule: 'date.format',
            field: 'departure_datetime',
            message: 'La date de départ doit être une date valide (ISO format)',
            args: {},
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
        ],
      },
      {
        data: {
          page: 'fake page',
          departure_location: 'fake test 1',
          arrival_location: 'fake test 2',
          departure_datetime: '2020-01-01T00:00:00.000Z',
          max_passengers: 4,
        },
        errors: [
          {
            rule: 'number',
            field: 'page',
            message: 'La page doit être un nombre',
          },
          {
            rule: 'afterOrEqual',
            field: 'departure_datetime',
            message: "La date de départ doit être supérieure ou égale à aujourd'hui",
            args: {
              afterOrEqual: DateTime.now().toISO(),
            },
          },
        ],
      },
    ])
    .run(async ({ client, assert }, row: any) => {
      const user = await User.findBy('email', 'test@papotecar.com')

      const response = await client
        .get(`/trips?${new URLSearchParams(row.data).toString()}`)
        .loginAs(user!)

      assert.equal(response.status(), 422)

      if (row.data.departure_datetime === '2020-01-01T00:00:00.000Z') {
        assert.equal(response.body().errors[0].message, 'La page doit être un nombre')
        assert.equal(
          response.body().errors[1].message,
          "La date de départ doit être supérieure ou égale à aujourd'hui"
        )

        return
      }

      assert.deepEqual(response.body().errors, row.errors)
    })

  test('it should return trips matching criteria')
    .with([
      {
        data: {
          page: 1,
          departure_location: 'Nantes',
          arrival_location: 'Paris',
          departure_datetime: '2027-09-01T08:30:00.000Z',
          max_passengers: 2,
        },
        expected: {
          resultLength: 2,
        },
      },
      {
        data: {
          page: 1,
          departure_location: 'Nantes',
          arrival_location: 'Paris',
          departure_datetime: '2027-09-01T08:30:00.000Z',
          max_passengers: 3,
        },
        expected: {
          resultLength: 1,
        },
      },
    ])
    .run(async ({ client, assert }, row: any) => {
      const user = await User.findBy('email', 'test@papotecar.com')

      const response = await client
        .get(`/trips?${new URLSearchParams(row.data).toString()}`)
        .loginAs(user!)

      assert.equal(response.status(), 200)
      assert.equal(response.body().data.length, row.expected.resultLength)
    })
})

test.group('Create trip', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that user is not authenticated', async ({ client, assert }) => {
    const response = await client.post('/trips').json({})

    assert.equal(response.status(), 401)
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
            message: 'La date de départ doit être une date valide (ISO format)',
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
    date.setHours(10, 30, 0, 0)

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
    assert.equal(response.body().message, 'E_DRIVER_ALREADY_BOOKED: Driver already booked')
  })

  test('it should return that user is a passenger in another trip', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')

    const trip = await Trip.query()
      .whereHas('passengers', (query) => {
        query.where('user_id', user!.id)
      })
      .first()

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
        departure_datetime: trip?.departureDatetime,
        max_passengers: 2,
        price: 100,
        content: null,
      })

    assert.equal(response.status(), 400)
    assert.equal(
      response.body().message,
      'E_USER_ALREADY_BOOKED: User is a passenger on a trip on the same date'
    )
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

    const message = await Message.query()
      .where('trip_id', response.body().id)
      .where('user_id', user!.id)
      .first()

    assert.equal(response.status(), 200)
    assert.exists(response.body().id)
    assert.exists(response.body().departure_location)
    assert.exists(response.body().arrival_location)
    assert.exists(response.body().departure_datetime)
    assert.exists(response.body().max_passengers)
    assert.exists(response.body().price)
    assert.exists(response.body().content)
    assert.exists(response.body().driver)

    assert.equal(
      message!.content,
      "Bonjour, je suis le conducteur de ce trajet. Si vous avez des questions, n'hésitez pas à me contacter."
    )
  })
})

test.group('Update trip', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that user is not authenticated', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const trip = await Trip.query().where('driver_id', user!.id).first()
    const response = await client.put(`/trips/${trip!.id}`).json({})

    assert.equal(response.status(), 401)
  })

  test('it should return that id is not an uuid', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')

    const response = await client.put(`/trips/1`).loginAs(user!)

    assert.equal(response.status(), 422)
    assert.equal(response.body().errors[0].message, "L'identifiant doit être un UUID valide")
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
    assert.equal(
      response.body().message,
      'E_AUTHORIZATION_FAILURE: You cannot update a trip you are not the driver of'
    )
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
            message: 'La date de départ doit être une date valide (ISO format)',
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
    date.setHours(10, 30, 0, 0)

    const trip = await Trip.query()
      .where('driver_id', user!.id)
      .where('departure_datetime', date)
      .first()

    const newDate = new Date('2026-09-01')
    newDate.setHours(10, 30, 0, 0)

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
    assert.equal(response.body().message, 'E_DRIVER_ALREADY_BOOKED: Driver already booked')
  })

  test('it should return that user is a passenger in another trip', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')

    const date = new Date()
    date.setHours(10, 30, 0, 0)

    const trip = await Trip.query()
      .where('driver_id', user!.id)
      .where('departure_datetime', date)
      .first()

    const newDate = new Date('2027-09-01')
    newDate.setHours(10, 30, 0, 0)

    const response = await client
      .put(`/trips/${trip!.id}`)
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
        departure_datetime: DateTime.fromJSDate(newDate),
        max_passengers: 2,
        price: 100,
        content: null,
      })

    assert.equal(response.status(), 400)
    assert.equal(
      response.body().message,
      'E_USER_ALREADY_BOOKED: User is a passenger on a trip on the same date'
    )
  })

  test('it should return that trip is updated', async ({ client, assert }) => {
    const mailer = Mail.fake()

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

    assert.isTrue(
      mailer.exists((mail) => {
        return mail.subject === 'Papotecar - Votre trajet a été modifié'
      })
    )
  })
})

test.group('Delete trip', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that user is not authenticated', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const trip = await Trip.query().where('driver_id', user!.id).first()
    const response = await client.delete(`/trips/${trip!.id}`)

    assert.equal(response.status(), 401)
  })

  test('it should return that id is not an uuid', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')

    const response = await client.delete(`/trips/1`).loginAs(user!)

    assert.equal(response.status(), 422)
    assert.equal(response.body().errors[0].message, "L'identifiant doit être un UUID valide")
  })

  test('it should return that trip does not exist', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const response = await client.delete(`/trips/${uuid()}`).loginAs(user!)

    assert.equal(response.status(), 404)
  })

  test('it should return that user is not allowed to delete this trip', async ({
    client,
    assert,
  }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const trip = await Trip.query().whereNot('driver_id', user!.id).first()

    const response = await client.delete(`/trips/${trip!.id}`).loginAs(user!)

    assert.equal(response.status(), 403)
    assert.equal(
      response.body().message,
      'E_AUTHORIZATION_FAILURE: You cannot delete a trip you are not the driver of'
    )
  })

  test('it should return that trip is deleted', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const trip = await Trip.query().where('driver_id', user!.id).first()

    const response = await client.delete(`/trips/${trip!.id}`).loginAs(user!)

    assert.equal(response.status(), 204)
  })
})

test.group('Find a trip', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that user is not authenticated', async ({ client, assert }) => {
    const response = await client.get(`/trips/${uuid()}`)

    assert.equal(response.status(), 401)
  })

  test('it should return that trip does not exist', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const response = await client.get(`/trips/${uuid()}`).loginAs(user!)

    assert.equal(response.status(), 404)
  })

  test('it should return trip successfully', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@papotecar.com')
    const trip = await Trip.first()

    const response = await client.get(`/trips/${trip!.id}`).loginAs(user!)

    assert.equal(response.status(), 200)
    assert.exists(response.body().id)
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
