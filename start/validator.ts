import { validator } from '@ioc:Adonis/Core/Validator'
/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/

validator.rule('uniqueGpsCoordinates', (value, [compareCoords], options) => {
  if (typeof value !== 'object') {
    return
  }

  if (!compareCoords || typeof compareCoords !== 'object') {
    return
  }

  if (
    value.longitude === compareCoords.value.longitude &&
    value.latitude === compareCoords.value.latitude
  ) {
    options.errorReporter.report(
      options.pointer,
      'uniqueGpsCoordinates',
      'The coordinates must be unique',
      options.arrayExpressionPointer
    )
  }
})
