import Mail from '@ioc:Adonis/Addons/Mail'
import Trip from 'App/Models/Trip'
import User from 'App/Models/User'

class MailerService {
  public static async sendMailForPassengers(
    trip: Trip,
    template: string,
    subject: string,
    passengers?: User[]
  ) {
    let users

    if (!passengers) {
      users = await trip.related('passengers').query()
    } else {
      users = passengers
    }

    if (users.length > 0) {
      for (const user of users) {
        await Mail.sendLater((message) => {
          message
            .from('papotecar@gmail.com')
            .to(user.email)
            .subject(`Papotecar - ${subject}`)
            .htmlView(template, { user, trip })
        })
      }
    }
  }

  public static async sendMail(
    trip: Trip,
    user: User,
    template: string,
    subject: string,
    extraData: any
  ) {
    await Mail.sendLater((message) => {
      message
        .from('papotecar@gmail.com')
        .to(user.email)
        .subject(`Papotecar - ${subject}`)
        .htmlView(template, { user, trip, ...extraData })
    })
  }
}

export default MailerService
