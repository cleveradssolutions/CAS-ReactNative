package com.cas.extensions

import com.cleversolutions.ads.AdImpression
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap

fun AdImpression.toReadableMap(): ReadableMap {
  val map = WritableNativeMap()

  map.putInt("adType", this.adType.toInt())
  map.putDouble("cpm", this.cpm)
  map.putString("error", this.error)
  map.putString("identifier", this.identifier)
  map.putInt("impressionDepth", this.impressionDepth)
  map.putDouble("lifetimeRevenue", this.lifetimeRevenue)
  map.putString("network", this.network)
  map.putInt("priceAccuracy", this.priceAccuracy)
  map.putString("status", this.status)
  map.putString("versionInfo", this.versionInfo)

  this.creativeIdentifier?.let {
    map.putString("creativeIdentifier", it)
  }

  return map
}
