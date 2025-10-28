package com.cleveradssolutions.plugin.reactnative

import com.cleversolutions.ads.android.CASBannerView
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

@ReactModule(name = BannerViewManagerImpl.NAME)
class CASMobileAdsViewManager : SimpleViewManager<CASBannerView>() {

  override fun getName() = BannerViewManagerImpl.NAME

  override fun createViewInstance(ctx: ThemedReactContext): CASBannerView =
    BannerViewManagerImpl.createViewInstance(ctx)

  @ReactProp(name = "sizeConfig")
  fun setSizeConfig(view: CASBannerView, value: ReadableMap?) =
    BannerViewManagerImpl.setSizeConfig(view, value)

  @ReactProp(name = "autoReload", defaultBoolean = true)
  fun setAutoReload(view: CASBannerView, value: Boolean) =
    BannerViewManagerImpl.setAutoReload(view, value)

  @ReactProp(name = "refreshInterval")
  fun setRefreshInterval(view: CASBannerView, value: Int) =
    BannerViewManagerImpl.setRefreshInterval(view, value)

  @ReactProp(name = "casId")
  fun setCasId(view: CASBannerView, value: String?) =
    BannerViewManagerImpl.setCasId(view, value)

  override fun onAfterUpdateTransaction(view: CASBannerView) {
    super.onAfterUpdateTransaction(view)
    BannerViewManagerImpl.onAfterUpdateTransaction(view)
  }

  override fun onDropViewInstance(view: CASBannerView) {
    BannerViewManagerImpl.onDropViewInstance(view)
    super.onDropViewInstance(view)
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> =
    BannerViewManagerImpl.getExportedCustomDirectEventTypeConstants()

  override fun getCommandsMap(): Map<String, Int> = mapOf(
    "loadAd"  to 1
  )

  override fun receiveCommand(view: CASBannerView, commandId: Int, args: ReadableArray?) {
    when (commandId) {
      1 -> BannerViewManagerImpl.commandLoadAd(view)
    }
  }
}

