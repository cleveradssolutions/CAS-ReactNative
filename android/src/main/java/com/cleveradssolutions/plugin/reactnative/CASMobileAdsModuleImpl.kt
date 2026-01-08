package com.cleveradssolutions.plugin.reactnative

import android.app.Activity
import android.content.Context
import com.cleveradssolutions.plugin.reactnative.native.NativeAdAssetType
import com.cleveradssolutions.plugin.reactnative.native.NativeAdStore
import com.cleveradssolutions.sdk.AdContentInfo
import com.cleveradssolutions.sdk.AdFormat
import com.cleveradssolutions.sdk.OnAdImpressionListener
import com.cleveradssolutions.sdk.base.CASHandler
import com.cleveradssolutions.sdk.nativead.CASNativeLoader
import com.cleveradssolutions.sdk.nativead.NativeAdContent
import com.cleveradssolutions.sdk.nativead.NativeAdContentCallback
import com.cleveradssolutions.sdk.screen.CASAppOpen
import com.cleveradssolutions.sdk.screen.CASInterstitial
import com.cleveradssolutions.sdk.screen.CASRewarded
import com.cleversolutions.ads.AdError
import com.cleversolutions.ads.ConsentFlow
import com.cleversolutions.ads.InitialConfiguration
import com.cleversolutions.ads.InitializationListener
import com.cleversolutions.ads.android.CAS
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class CASMobileAdsModuleImpl(private val reactContext: ReactApplicationContext) {

  companion object {
    const val NAME = "CASMobileAds"

    const val NAME_NATIVE_VIEW = "CASNativeAdView"
    const val NAME_NATIVE_ASSET = "CASNativeAssetView"
    const val NAME_NATIVE_TEXT_ASSET = "CASNativeTextAssetView"

    var casIdentifier: String = ""
  }

  private var initConfig: WritableNativeMap? = null

  private var interstitialAd: CASInterstitial? = null
  private var rewardedAd: CASRewarded? = null
  private var appOpenAd: CASAppOpen? = null
  private var fieldNativeAdLoader: CASNativeLoader? = null

  private fun appContext(): Context = reactContext.applicationContext
  private fun currentActivity(): Activity? = reactContext.currentActivity

  private fun emitError(finalEvent: String) {
    val error = AdError.NOT_INITIALIZED
    val payload = WritableNativeMap().apply {
      putInt("code", error.code)
      putString("message", error.message)
    }
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(finalEvent, payload)
  }

  private fun emitLoadError(format: AdFormat) {
    emitError("on${format.label}FailedToLoad")
  }

  private fun emitShowError(format: AdFormat) {
    emitError("on${format.label}FailedToShow")
  }

  private fun createInterstitialAd() {
    val callback = ScreenContentCallback(reactContext, AdFormat.INTERSTITIAL.label)
    interstitialAd = CASInterstitial(appContext(), casIdentifier).apply {
      contentCallback = callback
      onImpressionListener = callback
    }
  }

  private fun createRewardedAd() {
    val callback = ScreenContentCallback(reactContext, AdFormat.REWARDED.label)
    rewardedAd = CASRewarded(appContext(), casIdentifier).apply {
      contentCallback = callback
      onImpressionListener = callback
    }
  }

  private fun createAppOpenAd() {
    val callback = ScreenContentCallback(reactContext, AdFormat.APP_OPEN.label)
    appOpenAd = CASAppOpen(appContext(), casIdentifier).apply {
      contentCallback = callback
      onImpressionListener = callback
    }
  }

  private fun getNativeAdLoader(): CASNativeLoader =
    fieldNativeAdLoader ?: CASNativeLoader(
      appContext(), casIdentifier, NativeCallback()
    ).also {
      fieldNativeAdLoader = it
    }

  fun initialize(casId: String, options: ReadableMap, promise: Promise) {
    if (initConfig != null && casIdentifier == casId) {
      promise.resolve(initConfig)
      return
    }

    casIdentifier = casId

    options.optIntOrNull("targetAudience")?.let { CAS.settings.taggedAudience = it }
    options.optStringSet("testDeviceIds")?.let { CAS.settings.testDeviceIDs = it }

    createInterstitialAd()
    createRewardedAd()
    createAppOpenAd()

    val builder = CAS.buildManager()
      .withCasId(casId)
      .withTestAdMode(options.optBoolean("forceTestAds", false))
      .withFramework("ReactNative", options.getString("reactNativeVersion")!!)
      .withCompletionListener(CompletionListener(promise))

    val showConsent = options.optBoolean("showConsentFormIfRequired", true)
    val consent = ConsentFlow(showConsent)
    options.optIntOrNull("debugGeography")?.let { consent.debugGeography = it }
    builder.withConsentFlow(consent)

    options.optMap("mediationExtras")?.let { extras ->
      val iterator = extras.keySetIterator()
      while (iterator.hasNextKey()) {
        val key = iterator.nextKey()
        val value = extras.getString(key)
        if (!value.isNullOrEmpty()) builder.withMediationExtras(key, value)
      }
    }

    builder.build(currentActivity() ?: appContext())
  }

  fun isInitialized(promise: Promise) {
    promise.resolve(initConfig != null)
  }

  fun showConsentFlow(promise: Promise) {
    CASHandler.main {
      ConsentFlow()
        .withUIContext(currentActivity())
        .withDismissListener(CompletionListener(promise))
        .show()
    }
  }

  fun getSDKVersion(promise: Promise) {
    promise.resolve(CAS.getSDKVersion())
  }

  fun setDebugLoggingEnabled(enabled: Boolean) {
    CAS.settings.debugMode = enabled
  }

  fun setAdSoundsMuted(muted: Boolean) {
    CAS.settings.mutedAdSounds = muted
  }

  fun setUserAge(age: Int) {
    CAS.getTargetingOptions().age = age
  }

  fun setUserGender(gender: Int) {
    CAS.getTargetingOptions().gender = gender
  }

  fun setAppContentUrl(contentUrl: String?) {
    CAS.getTargetingOptions().contentUrl = contentUrl
  }

  fun setAppKeywords(keywordsArray: ReadableArray?) {
    CAS.getTargetingOptions().keywords =
      keywordsArray?.toArrayList()?.filterIsInstance<String>()?.toSet()
  }

  fun setLocationCollectionEnabled(enabled: Boolean) {
    CAS.targetingOptions.locationCollectionEnabled = enabled
  }

  fun setTrialAdFreeInterval(interval: Int) {
    CAS.settings.trialAdFreeInterval = interval
  }

  fun isInterstitialAdLoaded(promise: Promise) {
    promise.resolve(interstitialAd?.isLoaded == true)
  }

  fun loadInterstitialAd() {
    interstitialAd?.load(appContext()) ?: emitLoadError(AdFormat.INTERSTITIAL)
  }

  fun showInterstitialAd() {
    interstitialAd?.show(currentActivity()) ?: emitShowError(AdFormat.INTERSTITIAL)
  }

  fun setInterstitialAutoloadEnabled(enabled: Boolean) {
    interstitialAd?.isAutoloadEnabled = enabled
  }

  fun setInterstitialAutoshowEnabled(enabled: Boolean) {
    interstitialAd?.isAutoshowEnabled = enabled
  }

  fun setInterstitialMinInterval(seconds: Int) {
    interstitialAd?.minInterval = seconds
  }

  fun restartInterstitialInterval() {
    interstitialAd?.restartInterval()
  }

  fun destroyInterstitial() {
    interstitialAd?.destroy()
    interstitialAd = null
    createInterstitialAd()
  }

  fun isRewardedAdLoaded(promise: Promise) {
    promise.resolve(rewardedAd?.isLoaded == true)
  }

  fun loadRewardedAd() {
    rewardedAd?.load(appContext()) ?: emitLoadError(AdFormat.REWARDED)
  }

  fun showRewardedAd() {
    val ad = rewardedAd ?: run {
      emitShowError(AdFormat.INTERSTITIAL)
      return
    }
    val callback = ad.contentCallback as ScreenContentCallback
    ad.show(currentActivity(), callback)
  }

  fun setRewardedAutoloadEnabled(enabled: Boolean) {
    rewardedAd?.isAutoloadEnabled = enabled
  }

  fun destroyRewarded() {
    rewardedAd?.destroy()
    rewardedAd = null
    createRewardedAd()
  }

  fun isAppOpenAdLoaded(promise: Promise) {
    promise.resolve(appOpenAd?.isLoaded == true)
  }

  fun loadAppOpenAd() {
    appOpenAd?.load(appContext()) ?: emitLoadError(AdFormat.APP_OPEN)
  }

  fun showAppOpenAd() {
    appOpenAd?.show(currentActivity()) ?: emitShowError(AdFormat.APP_OPEN)
  }

  fun setAppOpenAutoloadEnabled(enabled: Boolean) {
    appOpenAd?.isAutoloadEnabled = enabled
  }

  fun setAppOpenAutoshowEnabled(enabled: Boolean) {
    appOpenAd?.isAutoshowEnabled = enabled
  }

  fun destroyAppOpen() {
    appOpenAd?.destroy()
    appOpenAd = null
    createAppOpenAd()
  }

  fun loadNativeAd(maxNumberOfAds: Int) {
    getNativeAdLoader().load(maxNumberOfAds)
  }

  fun destroyNative(instanceId: Int) {
    CASHandler.main {
      val content = NativeAdStore.remove(instanceId)
      content?.onImpressionListener = null
      content?.destroy()
    }
  }

  fun setNativeMutedEnabled(enabled: Boolean) {
    getNativeAdLoader().isStartVideoMuted = enabled
  }

  fun setNativeAdChoicesPlacement(adChoicesPlacement: Int) {
    getNativeAdLoader().adChoicesPlacement = adChoicesPlacement
  }

  private inner class CompletionListener(
    private var promise: Promise?
  ) : InitializationListener, ConsentFlow.OnDismissListener {

    override fun onCASInitialized(config: InitialConfiguration) {
      initConfig = WritableNativeMap().apply {
        config.error?.let { putString("error", it) }
        config.countryCode?.let { putString("countryCode", it) }
        putBoolean("isConsentRequired", config.isConsentRequired)
        putInt("consentFlowStatus", config.consentFlowStatus)
      }
      promise?.resolve(initConfig)
      promise = null
    }

    override fun onConsentFlowDismissed(status: Int) {
      promise?.resolve(status)
      promise = null
    }
  }

  private inner class NativeCallback : NativeAdContentCallback(), OnAdImpressionListener {

    private fun emit(event: String, payload: Any? = null) {
      reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(event, payload)
    }

    private fun errorMap(error: AdError): WritableMap =
      WritableNativeMap().apply {
        putInt("code", error.code)
        putString("message", error.message)
      }

    override fun onNativeAdLoaded(nativeAd: NativeAdContent, ad: AdContentInfo) {
      val instanceId = NativeAdStore.save(nativeAd)
      nativeAd.onImpressionListener = this

      // Attention! Array order must be same as indexes in
      NativeAdAssetType
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

      emit("onNativeAdLoaded", WritableNativeMap().apply {
        putInt("instanceId", instanceId)
        putArray("content", content)
      })
    }

    override fun onNativeAdFailedToLoad(error: AdError) {
      emit("onNativeAdFailedToLoad", errorMap(error))
    }

    override fun onNativeAdClicked(nativeAd: NativeAdContent, ad: AdContentInfo) {
      emit("onNativeAdClicked", null)
    }

    override fun onNativeAdFailedToShow(nativeAd: NativeAdContent, error: AdError) {
      emit("onNativeAdFailedToShow", errorMap(error))
    }

    override fun onAdImpression(ad: AdContentInfo) {
      emit("onNativeAdImpression", ad.toWritableMap())
    }
  }
}
