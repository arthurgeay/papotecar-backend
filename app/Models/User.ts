import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel,
  manyToMany,
  ManyToMany,
  computed,
} from '@ioc:Adonis/Lucid/Orm'
import Trip from './Trip'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public email: string

  @column()
  public fullname: string

  @column({ serializeAs: null })
  public password: string

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @manyToMany(() => Trip, {
    pivotTable: 'passengers',
    localKey: 'id',
    relatedKey: 'id',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'trip_id',
    pivotTimestamps: true,
    pivotColumns: ['is_approve'],
  })
  public trips: ManyToMany<typeof Trip>

  @computed({ serializeAs: 'is_approved' })
  public get isApproved() {
    const approved = this.$extras.pivot_is_approve
    return approved
  }
}
