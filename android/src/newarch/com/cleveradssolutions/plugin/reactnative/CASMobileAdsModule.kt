package com.cleveradssolutions.plugin.reactnative

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = CASMobileAdsModuleImpl.NAME)
class CASMobileAdsModule(reactContext: ReactApplicationContext)
  : NativeCASMobileAdsModuleSpec(reactContext) {

  override fun getName() = CASMobileAdsModuleImpl.NAME

  private val impl = CASMobileAdsModuleImpl(reactContext)

  override fun initialize(casId: String, options: ReadableMap, promise: Promise) = impl.initialize(casId, options, promise)
  override fun isInitialized(promise: Promise) = impl.isInitialized(promise)
  override fun showConsentFlow(promise: Promise) = impl.showConsentFlow(promise)
  override fun getSDKVersion(promise: Promise) = impl.getSDKVersion(promise)
  override fun setDebugLoggingEnabled(enabled: Boolean) = impl.setDebugLoggingEnabled(enabled)
  override fun setAdSoundsMuted(muted: Boolean) = impl.setAdSoundsMuted(muted)
  override fun setUserAge(age: Double) = impl.setUserAge(age.toInt())
  override fun setUserGender(gender: Double) = impl.setUserGender(gender.toInt())
  override fun setAppContentUrl(contentUrl: String?) = impl.setAppContentUrl(contentUrl)
  override fun setAppKeywords(keywords: ReadableArray) = impl.setAppKeywords(keywords)
  override fun setLocationCollectionEnabled(enabled: Boolean) = impl.setLocationCollectionEnabled(enabled)
  override fun setTrialAdFreeInterval(interval: Double) = impl.setTrialAdFreeInterval(interval.toInt())
  override fun isInterstitialAdLoaded(promise: Promise) = impl.isInterstitialAdLoaded(promise)
  override fun loadInterstitialAd() = impl.loadInterstitialAd()
  override fun showInterstitialAd() = impl.showInterstitialAd()
  override fun setInterstitialAutoloadEnabled(enabled: Boolean) = impl.setInterstitialAutoloadEnabled(enabled)
  override fun setInterstitialAutoshowEnabled(enabled: Boolean) = impl.setInterstitialAutoshowEnabled(enabled)
  override fun setInterstitialMinInterval(seconds: Double) = impl.setInterstitialMinInterval(seconds.toInt())
  override fun restartInterstitialInterval() = impl.restartInterstitialInterval()
  override fun destroyInterstitial() = impl.destroyInterstitial()
  override fun isRewardedAdLoaded(promise: Promise) = impl.isRewardedAdLoaded(promise)
  override fun loadRewardedAd() = impl.loadRewardedAd()
  override fun showRewardedAd() = impl.showRewardedAd()
  override fun setRewardedAutoloadEnabled(enabled: Boolean) = impl.setRewardedAutoloadEnabled(enabled)
  override fun destroyRewarded() = impl.destroyRewarded()
  override fun isAppOpenAdLoaded(promise: Promise) = impl.isAppOpenAdLoaded(promise)
  override fun loadAppOpenAd() = impl.loadAppOpenAd()
  override fun showAppOpenAd() = impl.showAppOpenAd()
  override fun setAppOpenAutoloadEnabled(enabled: Boolean) = impl.setAppOpenAutoloadEnabled(enabled)
  override fun setAppOpenAutoshowEnabled(enabled: Boolean) = impl.setAppOpenAutoshowEnabled(enabled)
  override fun destroyAppOpen() = impl.destroyAppOpen()
  override fun addListener(eventName: String?) {  }
  override fun removeListeners(count: Double) {  }
}
