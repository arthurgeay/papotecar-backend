import Location, { Point } from 'App/Models/Location'

type LocationType = {
  name: string
  coordinates: Point
}
class LocationService {
  public static async getOrCreateLocations(
    departureLocation: LocationType,
    arrivalLocation: LocationType
  ) {
    const departureLocationId = await LocationService.getLocation(
      departureLocation.name,
      departureLocation.coordinates.longitude,
      departureLocation.coordinates.latitude
    )

    const arrivalLocationId = await LocationService.getLocation(
      arrivalLocation.name,
      arrivalLocation.coordinates.longitude,
      arrivalLocation.coordinates.latitude
    )

    return { departureLocationId, arrivalLocationId }
  }

  private static async getLocation(locationName: string, longitude: number, latitude: number) {
    const existingLocation = await Location.query()
      .whereRaw('name = ? AND coordinates ~= POINT(?, ?)', [locationName, longitude, latitude])
      .first()

    if (existingLocation) {
      return existingLocation?.$attributes.id
    } else {
      const newLocation = await Location.create({
        name: locationName,
        coordinates: {
          longitude,
          latitude,
        },
      })
      return newLocation.id
    }
  }
}

export default LocationService
