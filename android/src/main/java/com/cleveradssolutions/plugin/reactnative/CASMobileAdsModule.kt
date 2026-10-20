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
import com.cleversolutions.ads.LoadingManagerMode
import com.cleversolutions.ads.android.CAS
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule

@ReactModule(name = NativeCASMobileAdsModuleSpec.NAME)
class CASMobileAdsModule(reactContext: ReactApplicationContext) : NativeCASMobileAdsModuleSpec(reactContext) {

  companion object {
    const val NAME_BANNER = "CASAdView"

    const val NAME_NATIVE_VIEW = "CASNativeAdView"
    const val NAME_NATIVE_ASSET = "CASNativeAssetView"

    var casIdentifier: String = ""
  }

  private val screenContentCallback = ScreenContentCallback(this)
  private val nativeContentCallback = NativeContentCallback(this)
  private var initResult: InitialConfiguration? = null

  private val interstitialPool = ScreenAdPool(
    AdFormat.INTERSTITIAL,
    reactApplicationContext,
    screenContentCallback)

  private val rewardedPool = ScreenAdPool(
    AdFormat.REWARDED,
    reactApplicationContext,
    screenContentCallback)

  private val appOpenPool = ScreenAdPool(
    AdFormat.APP_OPEN,
    reactApplicationContext,
    screenContentCallback)

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

  private fun getPool(pool: ScreenAdPool): ScreenAdPool? {
    if (casIdentifier.isEmpty()) {
      logErrorCallBeforeInitialize()
      return null
    }

    pool.ensureInitialAd()
    return pool
  }

  private fun getInterstitialPool(): ScreenAdPool? =
    getPool(interstitialPool)

  private fun getRewardedPool(): ScreenAdPool? =
    getPool(rewardedPool)

  private fun getAppOpenPool(): ScreenAdPool? =
    getPool(appOpenPool)


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

    interstitialPool.setCasId(casId)
    rewardedPool.setCasId(casId)
    appOpenPool.setCasId(casId)

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

  override fun setInterstitialPreloadedBufferSize(size: Double) {
    CASHandler.main {
      getInterstitialPool()?.setTargetCount(size.toInt(), true)
    }
  }

  override fun getInterstitialLoadedAdCount(promise: Promise) {
    CASHandler.main {
      promise.resolve(getInterstitialPool()?.getLoadedAdCount() ?: 0)
    }
  }

  override fun isInterstitialAdLoaded(promise: Promise) {
    CASHandler.main {
      promise.resolve(getInterstitialPool()?.isLoaded() == true)
    }
  }

  override fun loadInterstitialAd() {
    CASHandler.main {
      val pool = getInterstitialPool()

      if (pool == null) {
        screenContentCallback.onAdFailedToLoad(AdFormat.INTERSTITIAL, AdError.NOT_INITIALIZED)
        return@main
      }

      pool.setTargetCount(1, pool.getAutoloadEnabled())
      pool.loadMissing()
    }
  }

  override fun showInterstitialAd() {
    CASHandler.main {
      val pool = getInterstitialPool()

      if (pool == null) {
        screenContentCallback.onAdFailedToShow(AdFormat.INTERSTITIAL, AdError.NOT_INITIALIZED)
        return@main
      }

      val ad = pool.getReadyAdToShow() as? CASInterstitial

      if (ad == null) {
        screenContentCallback.onAdFailedToShow(AdFormat.INTERSTITIAL, AdError.NOT_READY)
        return@main
      }

      Log.d("CAS.AI-RN", "Showing Interstitial. Loaded: ${pool.getLoadedAdCount()}, revenue: ${ad.contentInfo?.revenue}")
      ad.show(activity)
    }
  }

  override fun setInterstitialPlacement(placement: String?) {
    CASHandler.main {
      interstitialPool.setPlacement(placement)
      getInterstitialPool()
    }
  }

  override fun setInterstitialAutoloadEnabled(enabled: Boolean) {
    CASHandler.main {
      interstitialPool.setAutoloadEnabled(enabled)
      getInterstitialPool()
    }
  }

  override fun setInterstitialAutoshowEnabled(enabled: Boolean) {
    CASHandler.main {
      interstitialPool.setAutoshowEnabled(enabled)
      getInterstitialPool()
    }
  }

  override fun setInterstitialMinInterval(seconds: Double) {
    CASHandler.main {
      interstitialPool.setMinInterval(seconds.toInt())
      getInterstitialPool()
    }
  }

  override fun restartInterstitialInterval() {
    CASHandler.main {
      getInterstitialPool()?.restartInterval()
    }
  }

  override fun destroyInterstitial() {
    CASHandler.main {
      interstitialPool.destroy()
    }
  }

  // MARK: Rewarded ads

  override fun setRewardedPreloadedBufferSize(size: Double) {
    CASHandler.main {
      getRewardedPool()?.setTargetCount(size.toInt(), true)
    }
  }

  override fun getRewardedLoadedAdCount(promise: Promise) {
    CASHandler.main {
      promise.resolve(getRewardedPool()?.getLoadedAdCount() ?: 0)
    }
  }

  override fun isRewardedAdLoaded(promise: Promise) {
    CASHandler.main {
      promise.resolve(getRewardedPool()?.isLoaded() == true)
    }
  }

  override fun loadRewardedAd() {
    CASHandler.main {
      val pool = getRewardedPool()

      if (pool == null) {
        screenContentCallback.onAdFailedToLoad(AdFormat.REWARDED, AdError.NOT_INITIALIZED)
        return@main
      }

      pool.setTargetCount(1, pool.getAutoloadEnabled())
      pool.loadMissing()
    }
  }

  override fun showRewardedAd() {
    CASHandler.main {
      val pool = getRewardedPool()

      if (pool == null) {
        screenContentCallback.onAdFailedToShow(AdFormat.REWARDED, AdError.NOT_INITIALIZED)
        return@main
      }

      val ad = pool.getReadyAdToShow() as? CASRewarded

      if (ad == null) {
        screenContentCallback.onAdFailedToShow(AdFormat.REWARDED, AdError.NOT_READY)
        return@main
      }

      Log.d("CAS.AI-RN", "Showing Rewarded. Loaded: ${pool.getLoadedAdCount()}, revenue: ${ad.contentInfo?.revenue}")
      ad.show(activity, screenContentCallback)
    }
  }

  override fun setRewardedPlacement(placement: String?) {
    CASHandler.main {
      rewardedPool.setPlacement(placement)
      getRewardedPool()
    }
  }

  override fun setRewardedAutoloadEnabled(enabled: Boolean) {
    CASHandler.main {
      rewardedPool.setAutoloadEnabled(enabled)
      getRewardedPool()
    }
  }

  override fun setRewardedSSVerificationData(data: String?) {
    CASHandler.main {
      rewardedPool.setServerSideVerificationData(data)
      getRewardedPool()
    }
  }

  override fun destroyRewarded() {
    CASHandler.main {
      rewardedPool.destroy()
    }
  }

  // MARK: AppOpen ads

  override fun setAppOpenPreloadedBufferSize(size: Double) {
    CASHandler.main {
      getAppOpenPool()?.setTargetCount(size.toInt(), true)
    }
  }

  override fun getAppOpenLoadedAdCount(promise: Promise) {
    CASHandler.main {
      promise.resolve(getAppOpenPool()?.getLoadedAdCount() ?: 0)
    }
  }

  override fun isAppOpenAdLoaded(promise: Promise) {
    CASHandler.main {
      promise.resolve(getAppOpenPool()?.isLoaded() == true)
    }
  }

  override fun loadAppOpenAd() {
    CASHandler.main {
      val pool = getAppOpenPool()

      if (pool == null) {
        screenContentCallback.onAdFailedToLoad(AdFormat.APP_OPEN, AdError.NOT_INITIALIZED)
        return@main
      }

      pool.setTargetCount(1, pool.getAutoloadEnabled())
      pool.loadMissing()
    }
  }

  override fun showAppOpenAd() {
    CASHandler.main {
      val pool = getAppOpenPool()

      if (pool == null) {
        screenContentCallback.onAdFailedToShow(AdFormat.APP_OPEN, AdError.NOT_INITIALIZED)
        return@main
      }

      val ad = pool.getReadyAdToShow() as? CASAppOpen

      if (ad == null) {
        screenContentCallback.onAdFailedToShow(AdFormat.APP_OPEN, AdError.NOT_READY)
        return@main
      }

      Log.d("CAS.AI-RN", "Showing AppOpen. Loaded: ${pool.getLoadedAdCount()}, revenue: ${ad.contentInfo?.revenue}")
      ad.show(activity)
    }
  }


  override fun setAppOpenPlacement(placement: String?) {
    CASHandler.main {
      appOpenPool.setPlacement(placement)
      getAppOpenPool()
    }
  }

  override fun setAppOpenAutoloadEnabled(enabled: Boolean) {
    CASHandler.main {
      appOpenPool.setAutoloadEnabled(enabled)
      getAppOpenPool()
    }
  }

  override fun setAppOpenAutoshowEnabled(enabled: Boolean) {
    CASHandler.main {
      appOpenPool.setAutoshowEnabled(enabled)
      getAppOpenPool()
    }
  }

  override fun destroyAppOpen() {
    CASHandler.main {
      appOpenPool.destroy()
    }
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
