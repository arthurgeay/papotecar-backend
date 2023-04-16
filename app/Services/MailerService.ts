import Mail from '@ioc:Adonis/Addons/Mail'
import Trip from 'App/Models/Trip'

class MailerService {
  public static async sendMailForPassengers(trip: Trip) {
    const passengers = await trip.related('passengers').query()

    if (passengers.length > 0) {
      for (const passenger of passengers) {
        await Mail.sendLater((message) => {
          message
            .from('papotecar@gmail.com')
            .to(passenger.email)
            .subject('Papotecar - Votre trajet a été modifié')
            .htmlView('emails/updated_trip', { user: passenger, trip })
        })
      }
    }
  }
}

export default MailerService
