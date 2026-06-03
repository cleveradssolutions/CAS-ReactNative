@file:Suppress("unused")

package com.cleveradssolutions.plugin.reactnative

import android.app.Activity
import android.util.Log
import com.cleveradssolutions.plugin.reactnative.native.NativeAdStore
import com.cleveradssolutions.sdk.AdFormat
import com.cleveradssolutions.sdk.base.CASHandler
import com.cleveradssolutions.sdk.nativead.CASNativeLoader
import com.cleveradssolutions.sdk.screen.CASAppOpen
import com.cleveradssolutions.sdk.screen.CASInterstitial
import com.cleveradssolutions.sdk.screen.CASRewarded
import com.cleversolutions.ads.AdError
import com.cleversolutions.ads.ConsentFlow
import com.cleversolutions.ads.InitialConfiguration
import com.cleversolutions.ads.InitializationListener
import com.cleversolutions.ads.android.CAS
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule

@ReactModule(name = NativeCASMobileAdsModuleSpec.NAME)
class CASMobileAdsModule(
  reactContext: ReactApplicationContext
) : NativeCASMobileAdsModuleSpec(reactContext) {

  companion object {
    const val NAME_BANNER = "CASAdView"

    const val NAME_NATIVE_VIEW = "CASNativeAdView"
    const val NAME_NATIVE_ASSET = "CASNativeAssetView"

    var casIdentifier: String = ""
  }

  private val screenContentCallback = ScreenContentCallback(this)
  private val nativeContentCallback = NativeContentCallback(this)
  private var initResult: InitialConfiguration? = null

  private var appOpenAd: CASAppOpen? = null
    get() = if (field != null) {
      field
    } else if (casIdentifier.isEmpty()) {
      logErrorCallBeforeInitialize()
      null
    } else {
      CASAppOpen(reactApplicationContext, casIdentifier).also {
        field = it
        it.contentCallback = screenContentCallback
        it.onImpressionListener = screenContentCallback
      }
    }

  private var interstitialAd: CASInterstitial? = null
    get() = if (field != null) {
      field
    } else if (casIdentifier.isEmpty()) {
      logErrorCallBeforeInitialize()
      null
    } else {
      CASInterstitial(reactApplicationContext, casIdentifier).also {
        field = it
        it.contentCallback = screenContentCallback
        it.onImpressionListener = screenContentCallback
      }
    }

  private var rewardedAd: CASRewarded? = null
    get() = if (field != null) {
      field
    } else if (casIdentifier.isEmpty()) {
      logErrorCallBeforeInitialize()
      null
    } else {
      CASRewarded(reactApplicationContext, casIdentifier).also {
        field = it
        it.contentCallback = screenContentCallback
        it.onImpressionListener = screenContentCallback
      }
    }

  private var nativeAdLoader: CASNativeLoader? = null
    get() = if (field != null) {
      field
    } else if (casIdentifier.isEmpty()) {
      logErrorCallBeforeInitialize()
      null
    } else {
      field = CASNativeLoader(reactApplicationContext, casIdentifier, nativeContentCallback)
      field
    }

  private fun logErrorCallBeforeInitialize() {
    Log.e(
      "CAS.AI-RN", "CASMobileAds must be initialized before calling ads functions"
    )
  }

  private val activity: Activity?
    get() = reactApplicationContext.currentActivity

  override fun initialize(casId: String, options: ReadableMap, promise: Promise) {
    initResult?.let {
      if (casIdentifier == casId) {
        promise.resolve(
          getInitResultMap(
            it.error,
            it.countryCode,
            it.isConsentRequired,
            it.consentFlowStatus
          )
        )
        return
      }
    }

    if (casIdentifier.isNotEmpty() && casId != casIdentifier) {
      promise.resolve(
        getInitResultMap(
          "Only one CAS ID is supported per session",
          null,
          false,
          ConsentFlow.Status.UNKNOWN
        )
      )
      return
    }
    casIdentifier = casId

    options.optIntOrNull("targetAudience")?.let {
      CAS.settings.taggedAudience = it
    }
    options.optStringSet("testDeviceIds")?.let {
      CAS.settings.testDeviceIDs = it
    }

    val builder =
      CAS.buildManager().withCasId(casId).withTestAdMode(options.optBoolean("forceTestAds", false))
        .withFramework("ReactNative", options.getString("reactNativeVersion")!!)
        .withCompletionListener(CompletionListener(promise))

    val showConsent = options.optBoolean("showConsentFormIfRequired", true)
    val consent = ConsentFlow(showConsent)
    options.optIntOrNull("debugGeography")?.let {
      consent.debugGeography = it
    }
    builder.withConsentFlow(consent)

    options.optMap("mediationExtras")?.let { extras ->
      val iterator = extras.keySetIterator()
      while (iterator.hasNextKey()) {
        val key = iterator.nextKey()
        val value = extras.getString(key)
        if (!value.isNullOrEmpty()) builder.withMediationExtras(key, value)
      }
    }

    builder.build(activity ?: reactApplicationContext)
  }

  override fun isInitialized(promise: Promise) {
    promise.resolve(initResult != null)
  }

  override fun showConsentFlow(promise: Promise) {
    CASHandler.main {
      ConsentFlow().withUIContext(activity).withDismissListener(CompletionListener(promise)).show()
    }
  }

  override fun getSDKVersion(promise: Promise) {
    promise.resolve(CAS.getSDKVersion())
  }

  override fun setDebugLoggingEnabled(enabled: Boolean) {
    CAS.settings.debugMode = enabled
  }

  override fun setAdSoundsMuted(muted: Boolean) {
    CAS.settings.mutedAdSounds = muted
  }

  override fun setUserId(identifier: String?) {
    CAS.targetingOptions.userID = identifier
  }

  override fun setUserAge(age: Double) {
    CAS.targetingOptions.age = age.toInt()
  }

  override fun setUserGender(gender: Double) {
    CAS.targetingOptions.gender = gender.toInt()
  }

  override fun setAppContentUrl(contentUrl: String?) {
    CAS.targetingOptions.contentUrl = contentUrl
  }

  override fun setAppKeywords(keywordsArray: ReadableArray?) {
    CAS.targetingOptions.keywords =
      keywordsArray?.toArrayList()?.filterIsInstance<String>()?.toSet()
  }

  override fun setLocationCollectionEnabled(enabled: Boolean) {
    CAS.targetingOptions.locationCollectionEnabled = enabled
  }

  override fun setTrialAdFreeInterval(interval: Double) {
    CAS.settings.trialAdFreeInterval = interval.toInt()
  }

  // MARK: Interstitial ads

  override fun setInterstitialPlacement(placement: String?) {
    interstitialAd?.placement = placement
  }

  override fun isInterstitialAdLoaded(promise: Promise) {
    promise.resolve(interstitialAd?.isLoaded == true)
  }

  override fun loadInterstitialAd() {
    interstitialAd?.load(reactApplicationContext)
      ?: screenContentCallback.onAdFailedToLoad(AdFormat.INTERSTITIAL, AdError.NOT_INITIALIZED)
  }

  override fun showInterstitialAd() {
    interstitialAd?.show(activity) ?: screenContentCallback.onAdFailedToShow(
      AdFormat.INTERSTITIAL,
      AdError.NOT_INITIALIZED
    )
  }

  override fun setInterstitialAutoloadEnabled(enabled: Boolean) {
    interstitialAd?.isAutoloadEnabled = enabled
  }

  override fun setInterstitialAutoshowEnabled(enabled: Boolean) {
    interstitialAd?.isAutoshowEnabled = enabled
  }

  override fun setInterstitialMinInterval(seconds: Double) {
    interstitialAd?.minInterval = seconds.toInt()
  }

  override fun restartInterstitialInterval() {
    interstitialAd?.restartInterval()
  }

  override fun destroyInterstitial() {
    interstitialAd?.destroy()
    interstitialAd = null
  }

  // MARK: Rewarded ads

  override fun setRewardedPlacement(placement: String?) {
    rewardedAd?.placement = placement
  }

  override fun isRewardedAdLoaded(promise: Promise) {
    promise.resolve(rewardedAd?.isLoaded == true)
  }

  override fun loadRewardedAd() {
    rewardedAd?.load(reactApplicationContext)
      ?: screenContentCallback.onAdFailedToLoad(AdFormat.REWARDED, AdError.NOT_INITIALIZED)
  }

  override fun showRewardedAd() {
    rewardedAd?.show(activity, screenContentCallback) ?: screenContentCallback.onAdFailedToShow(
      AdFormat.REWARDED,
      AdError.NOT_INITIALIZED
    )
  }

  override fun setRewardedAutoloadEnabled(enabled: Boolean) {
    rewardedAd?.isAutoloadEnabled = enabled
  }

  override fun setRewardedSSVerificationData(data: String?) {
    rewardedAd?.serverSideVerificationData = data
  }

  override fun destroyRewarded() {
    rewardedAd?.destroy()
    rewardedAd = null
  }

  // MARK: AppOpen ads

  override fun setAppOpenPlacement(placement: String?) {
    appOpenAd?.placement = placement
  }

  override fun isAppOpenAdLoaded(promise: Promise) {
    promise.resolve(appOpenAd?.isLoaded == true)
  }

  override fun loadAppOpenAd() {
    appOpenAd?.load(reactApplicationContext)
      ?: screenContentCallback.onAdFailedToLoad(AdFormat.APP_OPEN, AdError.NOT_INITIALIZED)
  }

  override fun showAppOpenAd() {
    appOpenAd?.show(activity) ?: screenContentCallback.onAdFailedToShow(
      AdFormat.APP_OPEN,
      AdError.NOT_INITIALIZED
    )
  }

  override fun setAppOpenAutoloadEnabled(enabled: Boolean) {
    appOpenAd?.isAutoloadEnabled = enabled
  }

  override fun setAppOpenAutoshowEnabled(enabled: Boolean) {
    appOpenAd?.isAutoshowEnabled = enabled
  }

  override fun destroyAppOpen() {
    appOpenAd?.destroy()
    appOpenAd = null
  }

  // MARK: Native ads

  override fun loadNativeAd(maxNumberOfAds: Double) {
    nativeAdLoader?.load(maxNumberOfAds.toInt())
      ?: nativeContentCallback.onNativeAdFailedToLoad(AdError.NOT_INITIALIZED)
  }

  override fun destroyNative(instanceId: Double) {
    CASHandler.main {
      val content = NativeAdStore.remove(instanceId.toInt())
      content?.onImpressionListener = null
      content?.destroy()
    }
  }

  override fun isNativeExpired(instanceId: Double, promise: Promise) {
    val content = NativeAdStore.find(instanceId.toInt())
    promise.resolve(content?.isExpired ?: true)
  }

  @ReactMethod
  override fun setNativeMutedEnabled(enabled: Boolean) {
    nativeAdLoader?.isStartVideoMuted = enabled
  }

  override fun setNativeAdChoicesPlacement(adChoicesPlacement: Double) {
    nativeAdLoader?.adChoicesPlacement = adChoicesPlacement.toInt()
  }

  override fun setNativePlacement(placement: String?) {
    nativeAdLoader?.placement = placement
  }

  // MARK: Events

  override fun addListener(eventName: String?) {

  }

  override fun removeListeners(count: Double) {
  }

  fun emitEvent(event: String, map: ReadableMap?) {
    reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(event, map)
  }

  fun emitError(event: String, error: AdError) {
    emitEvent(event, WritableNativeMap().apply {
      putInt("code", error.code)
      putString("message", error.message)
    })
  }

  private fun getInitResultMap(
    error: String?,
    countryCode: String?,
    isConsentRequired: Boolean,
    consentFlowStatus: Int
  ) = WritableNativeMap().apply {
    error?.let { putString("error", it) }
    countryCode?.let { putString("countryCode", it) }
    putBoolean("isConsentRequired", isConsentRequired)
    putInt("consentFlowStatus", consentFlowStatus)
  }

  private inner class CompletionListener(
    private var promise: Promise?
  ) : InitializationListener, ConsentFlow.OnDismissListener {

    override fun onCASInitialized(config: InitialConfiguration) {
      if (config.error == null) {
        initResult = config
      }
      promise?.resolve(
        getInitResultMap(
          config.error,
          config.countryCode,
          config.isConsentRequired,
          config.consentFlowStatus
        )
      )
      promise = null
    }

    override fun onConsentFlowDismissed(status: Int) {
      promise?.resolve(status)
      promise = null
    }
  }
}
