package com.cleveradssolutions.plugin.reactnative

import com.cleveradssolutions.sdk.AdContentInfo
import com.cleveradssolutions.sdk.AdFormat
import com.cleveradssolutions.sdk.OnAdImpressionListener
import com.cleveradssolutions.sdk.screen.OnRewardEarnedListener
import com.cleveradssolutions.sdk.screen.ScreenAdContentCallback
import com.cleversolutions.ads.AdError
import com.facebook.react.bridge.WritableNativeMap

internal class ScreenContentCallback(
  private val module: CASMobileAdsModule
) : ScreenAdContentCallback(), OnAdImpressionListener, OnRewardEarnedListener {

  override fun onAdImpression(ad: AdContentInfo) {
    module.emitEvent("on${ad.format.label}Impression", ad.toWritableMap())
  }

  override fun onUserEarnedReward(ad: AdContentInfo) {
    module.emitEvent("on${ad.format.label}Completed", WritableNativeMap())
  }

  override fun onAdLoaded(ad: AdContentInfo) {
    module.emitEvent("on${ad.format.label}Loaded", WritableNativeMap())
  }

  override fun onAdFailedToLoad(format: AdFormat, error: AdError) {
    module.emitError("on${format.label}FailedToLoad", error)
  }

  override fun onAdShowed(ad: AdContentInfo) {
    module.emitEvent("on${ad.format.label}Showed", WritableNativeMap())
  }

  override fun onAdFailedToShow(format: AdFormat, error: AdError) {
    module.emitError("on${format.label}FailedToShow", error)
  }

  override fun onAdClicked(ad: AdContentInfo) {
    module.emitEvent("on${ad.format.label}Clicked", WritableNativeMap())
  }

  override fun onAdDismissed(ad: AdContentInfo) {
    module.emitEvent("on${ad.format.label}Dismissed", WritableNativeMap())
  }
}
