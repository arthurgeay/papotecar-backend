import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'

test.group('Register', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should validation failed', async ({ client, assert }, row) => {
    const response = await client.post('/register').json(row.data)

    assert.equal(response.status(), 422)
    assert.equal(response.body().errors[0].message, row.error)
  }).with([
    {
      data: { email: 'fake@gmail.com', password: 'test' },
      error: 'Le nom complet est requis',
    },
    {
      data: { fullname: 'li', email: 'fake@gmail.com', password: 'test' },
      error: 'Le nom complet doit contenir au moins 3 caractères',
    },
    {
      data: { fullname: 'Test', password: 'test' },
      error: "L'email est requis",
    },
    {
      data: { fullname: 'Test', email: 'fake', password: 'test' },
      error: "L'email n'est pas valide",
    },
    {
      data: { fullname: 'Test', email: 'fake@gmail.com' },
      error: 'Le mot de passe est requis',
    },
    {
      data: { fullname: 'Test', email: 'fake@gmail.com', password: 'e' },
      error: 'Le mot de passe doit contenir au moins 8 caractères',
    },
    {
      data: { fullname: 'Test', email: 'test@papotecar.com', password: 'test12334' },
      error: 'Cet email est déjà utilisé',
    },
  ])

  test('it should register user', async ({ client, assert }) => {
    const response = await client.post('/register').json({
      fullname: 'John Doe',
      email: 'john@doe.com',
      password: 'test12334',
    })

    assert.equal(response.status(), 200)
    assert.exists(response.body().token)
  })
})
