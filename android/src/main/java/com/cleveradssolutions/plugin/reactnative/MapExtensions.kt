package com.cleveradssolutions.plugin.reactnative

import com.cleveradssolutions.sdk.AdContentInfo
import com.cleveradssolutions.sdk.AdRevenuePrecision
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap

fun AdContentInfo.toWritableMap(): WritableMap {
  val map = WritableNativeMap()
  map.putString("format", this.format.label)
  map.putDouble("revenue", this.revenue)
  map.putString("revenuePrecision", when (this.revenuePrecision) {
    AdRevenuePrecision.PRECISE -> "precise"
    AdRevenuePrecision.FLOOR -> "floor"
    AdRevenuePrecision.ESTIMATED -> "estimated"
    else -> "unknown"
  })
  map.putString("sourceUnitId", this.sourceUnitId)
  map.putString("sourceName", this.sourceName)
  this.creativeId?.let { map.putString("creativeId", it) }
  map.putDouble("revenueTotal", this.revenueTotal)
  map.putInt("impressionDepth", this.impressionDepth)
  return map
}

inline fun ReadableMap.has(key: String, cb: () -> Unit) {
  if (hasKey(key) && !isNull(key)) cb()
}

fun ReadableMap.optBoolean(key: String, default: Boolean): Boolean =
  if (this.hasKey(key) && !isNull(key)) getBoolean(key) else default

fun ReadableMap.optIntOrNull(key: String): Int? =
  if (this.hasKey(key) && !isNull(key)) getInt(key) else null

fun ReadableMap.optStringOrNull(key: String): String? =
  if (this.hasKey(key) && !isNull(key)) getString(key) else null


fun ReadableMap.optStringSet(key: String): HashSet<String>? {
  if (!hasKey(key) || isNull(key)) return null
  val arr: ReadableArray = getArray(key) ?: return null
  val out = HashSet<String>(arr.size())
  for (i in 0 until arr.size()) {
    arr.getString(i)?.let {
      out.add(it)
    }
  }
  return out
}

fun ReadableMap.optMap(key: String): ReadableMap? =
  if (hasKey(key) && !isNull(key)) getMap(key) else null
