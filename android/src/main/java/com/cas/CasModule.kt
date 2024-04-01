package com.cas

import android.location.Location
import android.util.Log
import androidx.preference.PreferenceManager
import com.cas.extensions.*
import com.cleversolutions.ads.AdType
import com.cleversolutions.ads.ConsentFlow
import com.cleversolutions.ads.android.CAS
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule


class CasModule(context: ReactApplicationContext, private val managerWrapper: MediationManagerWrapper): ReactContextBaseJavaModule(context) {
  override fun getName() = "CasModule"

  @ReactMethod
  @Suppress("unused")
  fun buildManager(params: ReadableMap, promise: Promise) {
    try {
      reactApplicationContext.currentActivity?.let { activity ->
        val responseMap = WritableNativeMap();

        val buildManager = CAS.buildManager()
          .withCasId(params.getString("casId") ?: activity.packageName)
          .withCompletionListener {
            managerWrapper.manager = it.manager

            it.error?.let { error -> responseMap.putString("error", error) }
            it.countryCode?.let { code -> responseMap.putString("countryCode", code) }
            responseMap.putBoolean("isConsentRequired", it.isConsentRequired)

            promise.resolve(responseMap)
          }

        params.getMap("consentFlow")?.let { consentFlowParams ->
          if (consentFlowParams.hasKey("enabled") && !consentFlowParams.getBoolean("enabled")) {
            buildManager.withConsentFlow(ConsentFlow(false))
          } else {
            val flow = ConsentFlow()

            if (consentFlowParams.getStringOrEmpty("privacyPolicy").isNotEmpty()) {
              flow.withPrivacyPolicy(consentFlowParams.getStringOrEmpty("privacyPolicy"))
            }

            flow
              .withDismissListener { status ->
                val dismissMap = WritableNativeMap()
                dismissMap.putMap("settings", CAS.settings.toReadableMap())
                dismissMap.putInt("status", status)

                reactApplicationContext
                  .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                  .emit("consentFlowDismissed", dismissMap)
              }
              .withUIContext(reactApplicationContext.currentActivity)
              .show()

            buildManager.withConsentFlow(flow)
          }
        }

        params.getString("managerId")?.let {
          buildManager.withManagerId(it)
        }

        params.getString("userId")?.let {
          buildManager.withUserID(it)
        }

        params.has("testMode") {
          buildManager.withTestAdMode(params.getBoolean("testMode"))
        }

        params.getArray("adTypes")?.let {
          val arr = it.toArrayList().mapNotNull { type ->
            if (type is Double) type.toInt().toEnum<AdType>() else null
          }.toTypedArray()

          buildManager.withAdTypes(*arr)
        }

        params.getMap("mediationExtra")?.let {
          val key = it.getString("key")
          val value = it.getString("value")

          if (key != null && value != null) {
            buildManager.withMediationExtras(key, value)
          }
        }

        buildManager.initialize(activity.application)
      }

      if (reactApplicationContext.currentActivity == null) {
        promise.reject(Error("No activity in react application context!"))
      }
    } catch (e: Exception) {
      promise.reject(e)
    }
  }

  @ReactMethod
  @Suppress("unused")
  fun showConsentFlow(params: ReadableMap, callback: Callback) {
    val flow = ConsentFlow()
    val privacyPolicy = params.getStringOrEmpty("privacyPolicy")

    if (privacyPolicy.isNotEmpty()) {
      flow.withPrivacyPolicy(privacyPolicy)
    }

    flow
      .withDismissListener { status ->
        val dismissMap = WritableNativeMap()
        dismissMap.putMap("settings", CAS.settings.toReadableMap())
        dismissMap.putInt("status", status)

        callback.invoke(dismissMap)
      }
      .withUIContext(reactApplicationContext.currentActivity)
      .show()
  }

  @ReactMethod
  @Suppress("unused")
  fun getSDKVersion(promise: Promise) {
    promise.resolve(CAS.getSDKVersion())
  }

  @ReactMethod
  @Suppress("unused")
  fun getTargetingOptions(promise: Promise) {
    val options = CAS.getTargetingOptions()
    val map = WritableNativeMap()

    map.putInt("age", options.age)
    map.putInt("gender", options.gender)

    options.location?.let {
      map.putMap("location", it.toReadableMap())
    }

    promise.resolve(map)
  }

  @ReactMethod
  @Suppress("unused")
  fun setTargetingOptions(map: ReadableMap) {
    CAS.getTargetingOptions().let { to ->
      map.has("age") {
        to.age = map.getInt("age")
      }

      map.has("gender") {
        to.gender = map.getInt("gender")
      }

      map.has("location") {
        to.location = Location::class.fromReadableMap(map.getMap("location")!!)
      }

      map.has("contentUrl") {
        to.contentUrl = map.getString("contentUrl")
      }

      map.has("keywords") {
        to.keywords = (map.getArray("keywords")?.toArrayList() as? ArrayList<String>)?.toSet()
      }
    }
  }

  @ReactMethod
  @Suppress("unused")
  fun getSettings(promise: Promise) {
    promise.resolve(CAS.settings.toReadableMap())
  }

  @ReactMethod
  @Suppress("unused")
  fun setSettings(settings: ReadableMap) {
    CAS.settings.fromReadableMap(settings)
  }

  @ReactMethod
  @Suppress("unused")
  fun restartInterstitialInterval() {
    CAS.settings.restartInterstitialInterval()
  }

  @ReactMethod
  @Suppress("unused")
  fun debugValidateIntegration() {
    reactApplicationContext.currentActivity?.let {
      CAS.validateIntegration(it)
    }
  }

  /*
  Facebook specific
   */
  @ReactMethod
  @Suppress("unused")
  fun setAudienceNetworkDataProcessingOptions(map: ReadableMap) {
    try {
      // Reflection
      val clazz = Class.forName("com.cleveradssolutions.adapters.AudienceNetworkSettings")

      map.getArray("options")?.let { _options ->
        val options = Array(_options.size()) { _options.getString(it) }

        val country = map.getInt("country")
        val state = map.getInt("state")

        clazz.getMethod("setDataProcessingOptions", Array<String>::class.java, Int::class.java, Int::class.java).invoke(null, options, country, state)
      }
    } catch (e: Exception) {
      Log.e("RN CAS", e.message ?: e.toString())
    }
  }

  /*
  Google Ads specific
   */
  @ReactMethod
  @Suppress("unused")
  fun setGoogleAdsConsentForCookies(enabled: Boolean) {
    PreferenceManager.getDefaultSharedPreferences(reactApplicationContext)?.edit()
      ?.putInt("gad_has_consent_for_cookies", enabled.compareTo(false))?.apply()
  }

  /*
  RN stubs
   */
  @ReactMethod
  fun addListener(eventName: String?) {}

  @ReactMethod
  fun removeListeners(count: Int?) {}
}
