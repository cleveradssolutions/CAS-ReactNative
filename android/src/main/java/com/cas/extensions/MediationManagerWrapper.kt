package com.cas.extensions

import com.cleversolutions.ads.AdLoadCallback
import com.cleversolutions.ads.AdType
import com.cleversolutions.ads.MediationManager
import java.util.*
import kotlin.collections.HashMap

typealias MediationManagerListener = (manager: MediationManager?) -> Unit

class MediationManagerWrapper: AdLoadCallback {
  private val managerChangeListeners = HashMap<String, MediationManagerListener>()
  private val adLoadListeners = HashMap<String, AdLoadCallback>()

  var manager: MediationManager? = null
    set(value) {
      field = value
      managerChangeListeners.values.forEach { it(value) }
      field?.onAdLoadEvent?.add(this)
    }

  fun addChangeListener(listener: MediationManagerListener): String {
    val key = UUID.randomUUID().toString()
    managerChangeListeners[key] = listener
    return key
  }

  fun removeChangeListener(key: String) {
    managerChangeListeners.remove(key)
  }

  fun addLoadListener(listener: AdLoadCallback): String {
    val key = UUID.randomUUID().toString()
    adLoadListeners[key] = listener
    return key
  }

  fun removeLoadListener(key: String) {
    adLoadListeners.remove(key)
  }

  override fun onAdFailedToLoad(type: AdType, error: String?) {
    adLoadListeners.values.forEach { it.onAdFailedToLoad(type, error) }
  }

  override fun onAdLoaded(type: AdType) {
    adLoadListeners.values.forEach { it.onAdLoaded(type) }
  }
}
