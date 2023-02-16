import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import UserFactory from 'Database/factories/UserFactory'

export default class extends BaseSeeder {
  public async run() {
    await UserFactory.createMany(10)

    await User.create({
      email: 'test@papotecar.com',
      fullname: 'Test',
      password: 'password123',
    })
  }
}
