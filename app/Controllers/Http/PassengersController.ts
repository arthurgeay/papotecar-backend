import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Trip from 'App/Models/Trip'
import UuidParamValidator from 'App/Validators/UuidParamValidator'

export default class PassengersController {
  public async store({ request, params }: HttpContextContract) {
    await request.validate(UuidParamValidator)

    const trip = await Trip.findOrFail(params.id)

    // TODO : Vérifier que le voyage existe
    // TODO : Vérifier que l'utilisateur connecté n'est pas le créateur du voyage
    // TODO : Vérifier que l'utilisateur connecté n'est pas déjà inscrit à ce voyage
    // TODO : Vérifier que l'utilisateur n'est pas passager ou conducteur sur un autre voyage au même moment
    // TODO : Enregistrer la demande de passager pour le voyage

    // TODO : Faire les tests
    // TODO : Mettre la doc à jour
  }
}
