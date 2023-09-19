package com.cas.extensions

import com.facebook.react.bridge.ReadableMap

fun ReadableMap.getStringOrEmpty(key: String): String {
  return this.getString(key) ?: ""
}

fun ReadableMap.getDoubleOrZero(key: String): Double {
  return if (this.hasKey(key)) {
    this.getDouble(key)
  } else 0.0
}

fun ReadableMap.getIntOrZero(key: String): Int {
  return if (this.hasKey(key)) {
    this.getInt(key)
  } else 0
}

fun ReadableMap.has(key: String, cb: () -> Unit) {
  if (hasKey(key)) cb()
}
