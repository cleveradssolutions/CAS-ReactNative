package com.cleveradssolutions.plugin.reactnative.native

import com.cleveradssolutions.sdk.base.CASHandler
import com.cleveradssolutions.sdk.nativead.NativeAdContent
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArraySet
import java.util.concurrent.atomic.AtomicInteger

object NativeAdStore {

  private val nextInstanceId = AtomicInteger(0)

  private val adById = ConcurrentHashMap<Int, NativeAdContent>()
  private val listenersById = ConcurrentHashMap<Int, CopyOnWriteArraySet<(NativeAdContent?) -> Unit>>()

  fun save(ad: NativeAdContent): Int {
    val id = nextInstanceId.getAndIncrement()
    adById[id] = ad
    notifyListeners(id, ad)
    return id
  }

  fun find(id: Int): NativeAdContent? = adById[id]

  fun remove(id: Int): NativeAdContent? {
    val removed = adById.remove(id)
    notifyListeners(id, null)
    return removed
  }

  fun subscribe(id: Int, listener: (NativeAdContent?) -> Unit): () -> Unit {
    val listeners = listenersById.getOrPut(id) { CopyOnWriteArraySet() }
    listeners.add(listener)
    CASHandler.main { listener(find(id)) }

    return {
      val current = listenersById[id]
      if(current != null) {
        current.remove(listener)
        if (current.isEmpty()) listenersById.remove(id)
      }
    }
  }

  private fun notifyListeners(id: Int, ad: NativeAdContent?) {
    val listeners = listenersById[id] ?: return
    val snapshot = listeners.toTypedArray()
    CASHandler.main {
      for (l in snapshot) l(ad)
    }
  }
}
