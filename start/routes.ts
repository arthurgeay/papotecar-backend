/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ response }) => {
  return response.redirect('/docs')
})

Route.post('/register', 'AuthController.register')
Route.post('/login', 'AuthController.login')

Route.group(() => {
  Route.post('/logout', 'AuthController.logout')

  Route.resource('trips', 'TripsController').apiOnly()
  Route.post('/trips/:id/passengers', 'PassengersController.store')
  Route.delete('/trips/:id/passengers/:passengerId', 'PassengersController.destroy')

  Route.put('/trips/:id/passengers/:passengerId/approve', 'PassengersController.approve')
  Route.delete('/trips/:id/passengers/:passengerId/disapprove', 'PassengersController.disapprove')

  Route.get('/me', 'UsersController.show')
  Route.get('/me/trips', 'UserTripsController.index')

  Route.get('/trips/:id/messages', 'MessagesController.show')
  Route.post('/trips/:id/messages', 'MessagesController.store')
}).middleware('auth')
