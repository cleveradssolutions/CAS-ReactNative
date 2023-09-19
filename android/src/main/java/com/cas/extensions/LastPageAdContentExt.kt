package com.cas.extensions

import com.cleversolutions.ads.LastPageAdContent
import com.facebook.react.bridge.ReadableMap
import kotlin.reflect.KClass

fun KClass<LastPageAdContent>.fromReadableMap(map: ReadableMap): LastPageAdContent {
  return LastPageAdContent(
    map.getStringOrEmpty("headline"),
    map.getStringOrEmpty("adText"),
    map.getStringOrEmpty("destinationURL"),
    map.getStringOrEmpty("imageURL"),
    map.getStringOrEmpty("iconURL")
  )
}
