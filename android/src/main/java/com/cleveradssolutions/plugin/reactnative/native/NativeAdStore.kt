package com.cleveradssolutions.plugin.reactnative.native

import android.util.Log
import com.cleveradssolutions.sdk.base.CASHandler
import com.cleveradssolutions.sdk.nativead.NativeAdContent
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArraySet
import java.util.concurrent.atomic.AtomicInteger

object NativeAdStore {
  private val nextInstanceId = AtomicInteger(0)
  private val adById = ConcurrentHashMap<Int, NativeAdContent>()

  fun save(ad: NativeAdContent): Int {
    val id = nextInstanceId.getAndIncrement()
    adById[id] = ad
    return id
  }

  fun find(id: Int): NativeAdContent? = adById[id]

  fun remove(id: Int): NativeAdContent? {
    val removed = adById.remove(id)
    return removed
  }

}
