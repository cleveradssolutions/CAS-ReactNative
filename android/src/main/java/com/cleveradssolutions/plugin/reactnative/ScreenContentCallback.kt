package com.cleveradssolutions.plugin.reactnative

import com.cleveradssolutions.sdk.AdContentInfo
import com.cleveradssolutions.sdk.AdFormat
import com.cleveradssolutions.sdk.OnAdImpressionListener
import com.cleveradssolutions.sdk.screen.OnRewardEarnedListener
import com.cleveradssolutions.sdk.screen.ScreenAdContentCallback
import com.cleversolutions.ads.AdError
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class ScreenContentCallback(
  private val reactContext: ReactApplicationContext,
  private val adType: String
) : ScreenAdContentCallback(), OnAdImpressionListener, OnRewardEarnedListener {

  private fun emit(event: String, map: ReadableMap = WritableNativeMap()) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(event, map)
  }

  private fun errorMap(error: AdError) = WritableNativeMap().apply {
    putInt("code", error.code)
    putString("message", error.message)
  }

  override fun onAdImpression(ad: AdContentInfo) {
    emit("on${adType}Impression", ad.toWritableMap())
  }

  override fun onUserEarnedReward(ad: AdContentInfo) {
    emit("on${adType}Completed", WritableNativeMap())
  }

  override fun onAdLoaded(ad: AdContentInfo) {
    emit("on${adType}Loaded", WritableNativeMap())
  }

  override fun onAdFailedToLoad(format: AdFormat, error: AdError) {
    emit("on${adType}FailedToLoad", errorMap(error))
  }

  override fun onAdShowed(ad: AdContentInfo) {
    emit("on${adType}Showed", WritableNativeMap())
  }

  override fun onAdFailedToShow(format: AdFormat, error: AdError) {
    emit("on${adType}FailedToShow", errorMap(error))
  }

  override fun onAdClicked(ad: AdContentInfo) {
    emit("on${adType}Clicked", WritableNativeMap())
  }

  override fun onAdDismissed(ad: AdContentInfo) {
    emit("on${adType}Dismissed", WritableNativeMap())
  }
}
