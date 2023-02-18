import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Location from './Location'
import User from './User'

export default class Trip extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public departureLocationId: string

  @column()
  public arrivalLocationId: string

  @column()
  public departureDatetime: DateTime

  @column()
  public maxPassengers: number

  @column()
  public price: number

  @column()
  public driverId: string

  @column()
  public content: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'driverId',
  })
  public driver: BelongsTo<typeof User>

  @belongsTo(() => Location, {
    foreignKey: 'departureLocationId',
  })
  public departureLocation: BelongsTo<typeof Location>

  @belongsTo(() => Location, {
    foreignKey: 'arrivalLocationId',
  })
  public arrivalLocation: BelongsTo<typeof Location>
}
