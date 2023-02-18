import Database from '@ioc:Adonis/Lucid/Database'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export type Point = {
  longitude: number
  latitude: number
}

export default class Location extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column({
    prepare: (value: Point) => {
      return Database.raw('POINT(?, ?)', [value.longitude, value.latitude])
    },
    serialize: (value: { x: number; y: number }) => {
      return {
        longitude: value.x,
        latitude: value.y,
      }
    },
  })
  public coordinates: Point
}
