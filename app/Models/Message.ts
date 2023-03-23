import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Trip from './Trip'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public tripId: string

  @column()
  public userId: string

  @column()
  public content: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Trip)
  public trip: BelongsTo<typeof Trip>
}
