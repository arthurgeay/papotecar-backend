import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  computed,
  hasMany,
  HasMany,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Location from './Location'
import User from './User'
import Message from './Message'

export default class Trip extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column({
    serializeAs: null,
  })
  public departureLocationId: string

  @column({
    serializeAs: null,
  })
  public arrivalLocationId: string

  @column()
  public departureDatetime: DateTime

  @column()
  public maxPassengers: number

  @column()
  public price: number

  @column({
    serializeAs: null,
  })
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
    serializeAs: 'departure_location',
  })
  public departureLocation: BelongsTo<typeof Location>

  @belongsTo(() => Location, {
    foreignKey: 'arrivalLocationId',
    serializeAs: 'arrival_location',
  })
  public arrivalLocation: BelongsTo<typeof Location>

  @manyToMany(() => User, {
    pivotTable: 'passengers',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'trip_id',
    pivotRelatedForeignKey: 'user_id',
    pivotTimestamps: true,
    pivotColumns: ['is_approve'],
  })
  public passengers: ManyToMany<typeof User>

  @hasMany(() => Message)
  public messages: HasMany<typeof Message>
}
