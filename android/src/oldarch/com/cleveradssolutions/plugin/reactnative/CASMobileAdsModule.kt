package com.cleveradssolutions.plugin.reactnative

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = CASMobileAdsModuleImpl.NAME)
class CASMobileAdsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  private val impl = CASMobileAdsModuleImpl(reactContext)

  override fun getName() = CASMobileAdsModuleImpl.NAME

  @ReactMethod
  fun initialize(casId: String, options: ReadableMap, promise: Promise) =
    impl.initialize(casId, options, promise)

  @ReactMethod fun isInitialized(promise: Promise) = impl.isInitialized(promise)
  @ReactMethod fun showConsentFlow(promise: Promise) = impl.showConsentFlow(promise)
  @ReactMethod fun getSDKVersion(promise: Promise) = impl.getSDKVersion(promise)

  @ReactMethod fun setDebugLoggingEnabled(enabled: Boolean) = impl.setDebugLoggingEnabled(enabled)
  @ReactMethod fun setAdSoundsMuted(muted: Boolean) = impl.setAdSoundsMuted(muted)

  @ReactMethod fun setUserAge(age: Int) = impl.setUserAge(age.toInt())
  @ReactMethod fun setUserGender(gender: Int) = impl.setUserGender(gender.toInt())

  @ReactMethod fun setAppContentUrl(contentUrl: String?) = impl.setAppContentUrl(contentUrl)
  @ReactMethod fun setAppKeywords(keywords: ReadableArray) = impl.setAppKeywords(keywords)
  @ReactMethod fun setLocationCollectionEnabled(enabled: Boolean) = impl.setLocationCollectionEnabled(enabled)
  @ReactMethod fun setTrialAdFreeInterval(interval: Double) = impl.setTrialAdFreeInterval(interval.toInt())

  @ReactMethod fun isInterstitialAdLoaded(promise: Promise) = impl.isInterstitialAdLoaded(promise)
  @ReactMethod fun loadInterstitialAd() = impl.loadInterstitialAd()
  @ReactMethod fun showInterstitialAd() = impl.showInterstitialAd()
  @ReactMethod fun setInterstitialAutoloadEnabled(enabled: Boolean) = impl.setInterstitialAutoloadEnabled(enabled)
  @ReactMethod fun setInterstitialAutoshowEnabled(enabled: Boolean) = impl.setInterstitialAutoshowEnabled(enabled)
  @ReactMethod fun setInterstitialMinInterval(seconds: Double) = impl.setInterstitialMinInterval(seconds.toInt())
  @ReactMethod fun restartInterstitialInterval() = impl.restartInterstitialInterval()
  @ReactMethod fun destroyInterstitial() = impl.destroyInterstitial()

  @ReactMethod fun isRewardedAdLoaded(promise: Promise) = impl.isRewardedAdLoaded(promise)
  @ReactMethod fun loadRewardedAd() = impl.loadRewardedAd()
  @ReactMethod fun showRewardedAd() = impl.showRewardedAd()
  @ReactMethod fun setRewardedAutoloadEnabled(enabled: Boolean) = impl.setRewardedAutoloadEnabled(enabled)
  @ReactMethod fun destroyRewarded() = impl.destroyRewarded()

  @ReactMethod fun isAppOpenAdLoaded(promise: Promise) = impl.isAppOpenAdLoaded(promise)
  @ReactMethod fun loadAppOpenAd() = impl.loadAppOpenAd()
  @ReactMethod fun showAppOpenAd() = impl.showAppOpenAd()
  @ReactMethod fun setAppOpenAutoloadEnabled(enabled: Boolean) = impl.setAppOpenAutoloadEnabled(enabled)
  @ReactMethod fun setAppOpenAutoshowEnabled(enabled: Boolean) = impl.setAppOpenAutoshowEnabled(enabled)
  @ReactMethod fun destroyAppOpen() = impl.destroyAppOpen()
  @ReactMethod fun loadNativeAd(maxNumberOfAds: Double) = impl.loadNativeAd(maxNumberOfAds.toInt())
  @ReactMethod fun setNativeMutedEnabled(enabled: Boolean) = impl.setNativeMutedEnabled(enabled)
  @ReactMethod fun setNativeAdChoicesPlacement(adChoicesPlacement: Double) = impl.setNativeAdChoicesPlacement(adChoicesPlacement.toInt())
  @ReactMethod fun destroyNative(instanceId: Double) = impl.destroyNative(instanceId.toInt())


  @ReactMethod
  fun addListener(eventName: String?) {  }

  @ReactMethod
  fun removeListeners(count: Double) {  }
}
