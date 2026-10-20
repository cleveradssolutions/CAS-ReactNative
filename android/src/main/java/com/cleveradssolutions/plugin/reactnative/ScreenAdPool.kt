
package com.cleveradssolutions.plugin.reactnative

import android.content.Context
import com.cleveradssolutions.sdk.AdFormat
import com.cleveradssolutions.sdk.screen.CASAppOpen
import com.cleveradssolutions.sdk.screen.CASInterstitial
import com.cleveradssolutions.sdk.screen.CASRewarded
import com.cleveradssolutions.sdk.screen.ScreenAdContent
import com.cleversolutions.ads.LoadingManagerMode
import com.cleversolutions.ads.android.CAS

internal class ScreenAdPool(
  private val format: AdFormat,
  private val context: Context,
  private val callback: ScreenContentCallback
) {

  companion object {
    const val MAX_PRELOADED_ADS = 4
  }

  private val ads = ArrayList<ScreenAdContent>(MAX_PRELOADED_ADS)

  private var casId: String? = null
  private var placement: String? = null
  private var autoloadEnabled: Boolean? = null
  private var autoshowEnabled: Boolean? = null
  private var minInterval: Int? = null
  private var serverSideVerificationData: String? = null

  fun setCasId(value: String) {
    casId = value
  }

  fun getAutoloadEnabled(): Boolean {
    return autoloadEnabled ?: (format != AdFormat.APP_OPEN && CAS.settings.loadingMode != LoadingManagerMode.Manual)
  }

  fun ensureInitialAd() {
    if (ads.isEmpty()) {
      setTargetCount(1, getAutoloadEnabled())
    }
  }

  private fun createAd(): ScreenAdContent {
    val id = checkNotNull(casId) { "CAS must be initialized before creating ads" }

    val ad: ScreenAdContent = when (format) {
      AdFormat.INTERSTITIAL -> CASInterstitial(context, id)
      AdFormat.REWARDED -> CASRewarded(context, id)
      AdFormat.APP_OPEN -> CASAppOpen(context, id)
      else -> error("Unsupported ad format: $format")
    }

    ad.contentCallback = callback
    ad.onImpressionListener = callback
    ad.placement = placement

    when (ad) {
      is CASInterstitial -> {
        val interval = minInterval
        if (interval != null) {
          ad.minInterval = interval
        }

        val autoshow = autoshowEnabled
        if (autoshow != null) {
          ad.isAutoshowEnabled = autoshow
        }
      }

      is CASRewarded -> {
        ad.serverSideVerificationData = serverSideVerificationData
      }

      is CASAppOpen -> {
        val autoshow = autoshowEnabled
        if (autoshow != null) {
          ad.isAutoshowEnabled = autoshow
        }
      }
    }

    return ad
  }

  fun setTargetCount(count: Int, autoloadEnabled: Boolean) {
    val targetCount = count.coerceAtLeast(0)

    while (ads.size > targetCount) {
      ads.removeAt(ads.lastIndex).destroy()
    }

    while (ads.size < targetCount) {
      ads.add(createAd())
    }

    for (ad in ads) {
      ad.isAutoloadEnabled = autoloadEnabled
    }
  }

  fun setPlacement(value: String?) {
    placement = value?.takeIf { it.isNotEmpty() }

    for (ad in ads) {
      ad.placement = placement
    }
  }

  fun setAutoloadEnabled(enabled: Boolean) {
    autoloadEnabled = enabled

    for (ad in ads) {
      ad.isAutoloadEnabled = enabled
    }
  }

  fun setAutoshowEnabled(enabled: Boolean) {
    autoshowEnabled = enabled

    for (ad in ads) {
      when (ad) {
        is CASInterstitial -> ad.isAutoshowEnabled = enabled
        is CASAppOpen -> ad.isAutoshowEnabled = enabled
      }
    }
  }

  fun setMinInterval(seconds: Int) {
    minInterval = seconds

    for (ad in ads) {
      if (ad is CASInterstitial) {
        ad.minInterval = seconds
      }
    }
  }

  fun restartInterval() {
    for (ad in ads) {
      if (ad is CASInterstitial) {
        ad.restartInterval()
      }
    }
  }

  fun setServerSideVerificationData(data: String?) {
    serverSideVerificationData = data

    for (ad in ads) {
      if (ad is CASRewarded) {
        ad.serverSideVerificationData = data
      }
    }
  }

  fun loadMissing() {
    for (ad in ads) {
      ad.load(null)
    }
  }

  fun getLoadedAdCount(): Int {
    var count = 0

    for (ad in ads) {
      if (ad.isLoaded) count++
    }

    return count
  }

  fun isLoaded(): Boolean {
    for (ad in ads) {
      if (ad.isLoaded) return true
    }

    return false
  }

  fun getReadyAdToShow(): ScreenAdContent? {
    var bestAd: ScreenAdContent? = null
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

  fun destroy() {
    for (ad in ads) {
      ad.destroy()
    }

    ads.clear()
  }
}
