import Location from 'App/Models/Location'

class LocationService {
  public static async getLocation(locationName: string, longitude: number, latitude: number) {
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
