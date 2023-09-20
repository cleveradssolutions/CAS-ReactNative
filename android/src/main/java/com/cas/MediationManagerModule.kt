package com.cas

import com.cas.extensions.MediationManagerWrapper
import com.cas.extensions.fromReadableMap
import com.cas.extensions.toInt
import com.cas.extensions.toReadableMap
import com.cleversolutions.ads.*
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule


class MediationManagerModule(context: ReactApplicationContext, private val managerWrapper: MediationManagerWrapper): ReactContextBaseJavaModule(context), AdLoadCallback,
  AdCallback {
  override fun getName() = "MediationManagerModule"
  private val subId = managerWrapper.addLoadListener(this)
  private val changeId = managerWrapper.addChangeListener { it?.let { initCASAppOpen() } }
  private var appOpenAd: CASAppOpen? = null

  companion object {
    private val APP_OPEN_AD_TYPE = 5
  }

  override fun invalidate() {
    managerWrapper.removeLoadListener(subId)
    managerWrapper.removeChangeListener(changeId)
    super.invalidate()
  }

  private fun initCASAppOpen() {
    appOpenAd = CASAppOpen.create(managerWrapper.manager!!)
  }

  @ReactMethod
  @Suppress("unused")
  fun setLastPageAdContent(content: ReadableMap) {
    managerWrapper.manager?.let {
      it.lastPageAdContent = LastPageAdContent::class.fromReadableMap(content)
    }
  }

  /*
  Interstitial
   */
  @ReactMethod
  @Suppress("unused")
  fun loadInterstitial() {
    managerWrapper.manager?.loadInterstitial()
  }

  @ReactMethod
  @Suppress("unused")
  fun isInterstitialReady(promise: Promise) {
    promise.resolve(managerWrapper.manager?.isInterstitialReady)
  }

  @ReactMethod
  @Suppress("unused")
  fun showInterstitial(callbackId: String) {
    reactApplicationContext.currentActivity?.let {
      managerWrapper.manager?.showInterstitial(it, createJSAdCallback("Interstitial", callbackId))
    }
  }

  /*
  RewardedAd
   */
  @ReactMethod
  @Suppress("unused")
  fun loadRewardedAd() {
    managerWrapper.manager?.loadRewardedAd()
  }

  @ReactMethod
  @Suppress("unused")
  fun isRewardedAdReady(promise: Promise) {
    promise.resolve(managerWrapper.manager?.isRewardedAdReady)
  }

  @ReactMethod
  @Suppress("unused")
  fun showRewardedAd(callbackId: String) {
    reactApplicationContext.currentActivity?.let {
      managerWrapper.manager?.showRewardedAd(it, createJSAdCallback("Rewarded", callbackId))
    }
  }

  /*
  AppReturn
   */
  @ReactMethod
  @Suppress("unused")
  fun enableAppReturnAds(callbackId: String) {
    managerWrapper.manager?.enableAppReturnAds(createJSAdCallback("AppReturn", callbackId))
  }

  @ReactMethod
  @Suppress("unused")
  fun disableAppReturnAds() {
    managerWrapper.manager?.disableAppReturnAds()
  }

  @ReactMethod
  @Suppress("unused")
  fun skipNextAppReturnAds() {
    managerWrapper.manager?.skipNextAppReturnAds()
  }

  /*
  AppOpen
   */
  @ReactMethod
  @Suppress("unused")
  fun loadAppOpenAd(isLandscape: Boolean) {
    appOpenAd?.loadAd(reactApplicationContext, isLandscape, object : LoadAdCallback {
        override fun onAdFailedToLoad(error: AdError) {
          val map = WritableNativeMap()

          map.putInt("type", APP_OPEN_AD_TYPE)
          map.putString("error", error.message)

          reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("adFailedToLoad", map)
        }

        override fun onAdLoaded() {
          val map = WritableNativeMap()

          map.putInt("type", APP_OPEN_AD_TYPE)

          reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("adLoaded", map)
        }
    })
  }

  @ReactMethod
  @Suppress("unused")
  fun isAppOpenAdAvailable(promise: Promise) {
    promise.resolve(appOpenAd?.isAdAvailable())
  }

  @ReactMethod
  @Suppress("unused")
  fun showAppOpenAd(callbackId: String) {
    reactApplicationContext.currentActivity?.let { activity ->
      appOpenAd?.let { ad ->
        ad.contentCallback = createJSAdCallback("AppOpen", callbackId)
        ad.show(activity)
      }
    }
  }

  private fun createJSAdCallback(module: String, callbackId: String): AdPaidCallback {
    return object : AdPaidCallback {
      override fun onShown(ad: AdImpression) {
        val map = WritableNativeMap()
        map.putString("callbackId", callbackId)
        //map.putMap("data", ad.toReadableMap())

        reactApplicationContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit("onShown", map)
      }

      override fun onShowFailed(message: String) {
        val map = WritableNativeMap()
        map.putString("callbackId", callbackId)
        map.putString("data", message)

        reactApplicationContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit("onShowFailed", map)
      }

      override fun onAdRevenuePaid(ad: AdImpression) {
        val map = WritableNativeMap()
        map.putString("callbackId", callbackId)
        map.putMap("data", ad.toReadableMap())

        reactApplicationContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit("onAdRevenuePaid", map)
      }

      override fun onClicked() {
        val map = WritableNativeMap()
        map.putString("callbackId", callbackId)

        reactApplicationContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit("onClicked", map)
      }

      override fun onComplete() {
        val map = WritableNativeMap()
        map.putString("callbackId", callbackId)

        reactApplicationContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit("onComplete", map)
      }

      override fun onClosed() {
        val map = WritableNativeMap()
        map.putString("callbackId", callbackId)

        reactApplicationContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit("onClosed", map)
      }
    }
  }

  override fun onAdFailedToLoad(type: AdType, error: String?) {
    val map = WritableNativeMap()

    map.putInt("type", type.toInt())
    map.putString("error", error)

    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("adFailedToLoad", map)
  }

  override fun onAdLoaded(type: AdType) {
    val map = WritableNativeMap()

    map.putInt("type", type.toInt())

    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("adLoaded", map)
  }

  /*
  RN stubs
   */
  @ReactMethod
  fun addListener(eventName: String?) {}

  @ReactMethod
  fun removeListeners(count: Int?) {}
}
