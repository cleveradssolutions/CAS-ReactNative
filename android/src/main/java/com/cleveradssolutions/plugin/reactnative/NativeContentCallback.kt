package com.cleveradssolutions.plugin.reactnative

import com.cleveradssolutions.plugin.reactnative.native.NativeAdStore
import com.cleveradssolutions.sdk.AdContentInfo
import com.cleveradssolutions.sdk.OnAdImpressionListener
import com.cleveradssolutions.sdk.nativead.NativeAdContent
import com.cleveradssolutions.sdk.nativead.NativeAdContentCallback
import com.cleversolutions.ads.AdError
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap

internal class NativeContentCallback(
  private val module: CASMobileAdsModule
) : NativeAdContentCallback(), OnAdImpressionListener {

  override fun onNativeAdLoaded(nativeAd: NativeAdContent, ad: AdContentInfo) {
    val instanceId = NativeAdStore.save(nativeAd)
    nativeAd.onImpressionListener = this

    // Attention! Array order must be same as indexes in NativeAdAssetType
    val content = WritableNativeArray()
    content.pushString(nativeAd.headline)
    content.pushString(nativeAd.body)
    content.pushString(nativeAd.callToAction)
    content.pushString(nativeAd.advertiser)
    content.pushString(nativeAd.store)
    content.pushString(nativeAd.price)
    content.pushString(nativeAd.reviewCount)
    content.pushString(nativeAd.starRating?.let { "%.1f".format(it) })
    content.pushString(nativeAd.adLabel)

    module.emitEvent("onNativeAdLoaded", WritableNativeMap().apply {
      putInt("instanceId", instanceId)
      putArray("content", content)
    })
  }

  override fun onNativeAdFailedToLoad(error: AdError) {
    module.emitError("onNativeAdFailedToLoad", error)
  }

  override fun onNativeAdClicked(nativeAd: NativeAdContent, ad: AdContentInfo) {
    module.emitEvent("onNativeAdClicked", null)
  }

  override fun onNativeAdFailedToShow(nativeAd: NativeAdContent, error: AdError) {
    module.emitError("onNativeAdFailedToShow", error)
  }

  override fun onAdImpression(ad: AdContentInfo) {
    module.emitEvent("onNativeAdImpression", ad.toWritableMap())
  }
}
