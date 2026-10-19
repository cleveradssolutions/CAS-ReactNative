
package com.cleveradssolutions.plugin.reactnative

import com.cleveradssolutions.sdk.screen.ScreenAdContent

internal class ScreenAdPool<T : ScreenAdContent>(private val createAd: () -> T) {

  companion object {
    const val MAX_PRELOADED_ADS = 4
  }

  private val ads = ArrayList<T>(MAX_PRELOADED_ADS)

  fun setTargetCount(count: Int, autoloadEnabled: Boolean) {
    while (ads.size > count) {
      ads.removeAt(ads.lastIndex).destroy()
    }

    while (ads.size < count) {
      ads.add(createAd())
    }

    ads.forEach {
      it.isAutoloadEnabled = autoloadEnabled
    }
  }

  fun loadMissing() {
    ads.forEach {
      it.load(null)
    }
  }

  fun getLoadedAdCount(): Int = ads.count { it.isLoaded }
  fun isLoaded(): Boolean = ads.any { it.isLoaded }

  fun getReadyAdToShow(): T? {
    var bestAd: T? = null
    var bestRevenue = -1.0

    for (ad in ads) {
      if (!ad.isLoaded) continue

      val revenue = ad.contentInfo?.revenue ?: -1.0

      if (bestAd == null || revenue > bestRevenue) {
        bestAd = ad
        bestRevenue = revenue
      }
    }

    return bestAd
  }

  fun forEachAd(action: (T) -> Unit) {
    ads.forEach(action)
  }

  fun destroy() {
    ads.forEach { it.destroy() }
    ads.clear()
  }
}
