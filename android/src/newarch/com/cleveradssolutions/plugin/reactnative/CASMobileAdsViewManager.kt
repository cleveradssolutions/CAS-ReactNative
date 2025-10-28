package com.cleveradssolutions.plugin.reactnative

import com.cleversolutions.ads.android.CASBannerView
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.CASAdViewManagerDelegate
import com.facebook.react.viewmanagers.CASAdViewManagerInterface

@ReactModule(name = BannerViewManagerImpl.NAME)
class CASMobileAdsViewManager :
  SimpleViewManager<CASBannerView>(),
  CASAdViewManagerInterface<CASBannerView> {

  private val delegate: ViewManagerDelegate<CASBannerView> =
    CASAdViewManagerDelegate(this)

  override fun getDelegate() = delegate
  override fun getName() = BannerViewManagerImpl.NAME
  override fun createViewInstance(ctx: ThemedReactContext): CASBannerView =
    BannerViewManagerImpl.createViewInstance(ctx)

  override fun setSizeConfig(view: CASBannerView, value: ReadableMap?) =
    BannerViewManagerImpl.setSizeConfig(view, value)

  override fun setAutoReload(view: CASBannerView, value: Boolean) =
    BannerViewManagerImpl.setAutoReload(view, value)

  override fun setRefreshInterval(view: CASBannerView, value: Int) =
    BannerViewManagerImpl.setRefreshInterval(view, value)

  override fun setCasId(view: CASBannerView, value: String?) =
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

  override fun loadAd(view: CASBannerView) = BannerViewManagerImpl.commandLoadAd(view)
}
