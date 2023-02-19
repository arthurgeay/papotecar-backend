import { Point } from './../app/Models/Location'

declare module '@ioc:Adonis/Core/Validator' {
  interface Rules {
    uniqueGpsCoordinates(compareCoords: Point): Rule
  }
}
