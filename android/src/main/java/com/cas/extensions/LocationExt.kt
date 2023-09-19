package com.cas.extensions

import android.location.Location
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap
import kotlin.reflect.KClass

fun KClass<Location>.fromReadableMap(map: ReadableMap): Location {
  val location = Location("")

  location.accuracy = map.getDoubleOrZero("accuracy").toFloat()
  location.altitude = map.getDoubleOrZero("altitude")
  location.bearing = map.getDoubleOrZero("bearing").toFloat()
  location.latitude = map.getDoubleOrZero("latitude")
  location.longitude = map.getDoubleOrZero("longitude")

  return location
}

fun Location.toReadableMap(): ReadableMap {
  val map = WritableNativeMap()

  map.putDouble("accuracy", accuracy.toDouble())
  map.putDouble("altitude", altitude)
  map.putDouble("bearing", bearing.toDouble())
  map.putDouble("latitude", latitude)
  map.putDouble("longitude", longitude)

  return map
}
