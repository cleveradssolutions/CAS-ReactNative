package com.cleveradssolutions.plugin.reactnative

import com.cleversolutions.ads.AdSize
import com.cleversolutions.ads.android.CASBannerView
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.CASAdViewManagerDelegate
import com.facebook.react.viewmanagers.CASAdViewManagerInterface
import kotlin.math.roundToInt

@ReactModule(name = CASMobileAdsModule.NAME_BANNER)
class CASMobileAdsViewManager : SimpleViewManager<CASBannerView>(),
  CASAdViewManagerInterface<CASBannerView> {
  private val delegate = CASAdViewManagerDelegate(this)

  override fun getName(): String = CASMobileAdsModule.NAME_BANNER
  override fun getDelegate(): ViewManagerDelegate<CASBannerView> = delegate
  override fun receiveCommand(root: CASBannerView, commandId: String, args: ReadableArray?) {
    delegate.receiveCommand(root, commandId, args)
  }

  override fun createViewInstance(ctx: ThemedReactContext): CASBannerView {
    val view = CASBannerView(ctx)
    view.isAutoloadEnabled = false
    view.casId = CASMobileAdsModule.casIdentifier
    val listener = ViewContentCallback(ctx)
    view.adListener = listener
    view.onImpressionListener = listener
    return view
  }

  override fun getExportedCustomDirectEventTypeConstants(): HashMap<String, Any> =
    hashMapOf(
      "onAdViewLoaded" to mapOf("registrationName" to "onAdViewLoaded"),
      "onAdViewFailed" to mapOf("registrationName" to "onAdViewFailed"),
      "onAdViewClicked" to mapOf("registrationName" to "onAdViewClicked"),
      "onAdViewImpression" to mapOf("registrationName" to "onAdViewImpression"),
    )

  @ReactProp(name = "sizeConfig")
  override fun setSizeConfig(view: CASBannerView, value: ReadableMap?) {
    if (value == null) return
    val adSize = when (value.getString("sizeType")) {
      "B" -> AdSize.BANNER
      "M" -> AdSize.MEDIUM_RECTANGLE
      "L" -> AdSize.LEADERBOARD
      "S" -> AdSize.getSmartBanner(view.context)
      "A" -> AdSize.getAdaptiveBanner(
        view.context,
        value.getDouble("maxWidth").roundToInt()
      )

      "I" -> AdSize.getInlineBanner(
        value.getDouble("maxWidth").roundToInt(),
        value.getDouble("maxHeight").roundToInt(),
      )

      else -> AdSize.BANNER
    }
    if (view.size != adSize) {
      val listener = view.adListener as ViewContentCallback
      listener.isWaitOfLoad = true
      view.size = adSize
    }
  }

  @ReactProp(name = "casId")
  override fun setCasId(view: CASBannerView, value: String?) {
    if (!value.isNullOrEmpty()) {
      view.casId = value
    }
  }

  @ReactProp(name = "autoReload", defaultBoolean = true)
  override fun setAutoReload(view: CASBannerView, enabled: Boolean) {
    // Set not to banner for wait all other properties
    val listener = view.adListener as? ViewContentCallback ?: return
    listener.isAutoloadEnabled = enabled
  }

  @ReactProp(name = "refreshInterval")
  override fun setRefreshInterval(view: CASBannerView, value: Int) {
    view.refreshInterval = value
  }

  @ReactProp(name = "placement")
  override fun setPlacement(view: CASBannerView, value: String?) {
    view.placement = value
  }

  override fun onAfterUpdateTransaction(view: CASBannerView) {
    super.onAfterUpdateTransaction(view)
    val listener = view.adListener as ViewContentCallback
    listener.viewId = view.id
    if (view.casId.isEmpty()) {
      view.casId = CASMobileAdsModule.casIdentifier
    }
    view.isAutoloadEnabled = listener.isAutoloadEnabled
    if (listener.isWaitOfLoad) {
      listener.isWaitOfLoad = false
      if (!listener.isAutoloadEnabled) {
        view.load()
      }
    }
  }

  override fun onDropViewInstance(view: CASBannerView) {
    view.destroy()
    super.onDropViewInstance(view)
  }

  @ReactMethod
  override fun loadAd(view: CASBannerView) {
    view.load()
  }
}
