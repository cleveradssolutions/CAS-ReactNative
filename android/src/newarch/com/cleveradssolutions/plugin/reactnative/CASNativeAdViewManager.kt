package com.cleveradssolutions.plugin.reactnative

import com.cleveradssolutions.plugin.reactnative.native.CASNativeAdView
import com.cleveradssolutions.plugin.reactnative.native.NativeAdViewManagerImpl
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.CASNativeAdViewManagerDelegate
import com.facebook.react.viewmanagers.CASNativeAdViewManagerInterface

@ReactModule(name = NativeAdViewManagerImpl.NAME)
class CASNativeAdViewManager :
  SimpleViewManager<CASNativeAdView>(),
  CASNativeAdViewManagerInterface<CASNativeAdView> {

  private val delegate: ViewManagerDelegate<CASNativeAdView> =
    CASNativeAdViewManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<CASNativeAdView> = delegate
  override fun getName(): String = NativeAdViewManagerImpl.NAME

  override fun createViewInstance(ctx: ThemedReactContext): CASNativeAdView =
    NativeAdViewManagerImpl.createViewInstance(ctx)

  override fun setInstanceId(view: CASNativeAdView, value: Int) =
    NativeAdViewManagerImpl.setInstanceId(view, value)

  override fun setWidth(view: CASNativeAdView, value: Float) =
    NativeAdViewManagerImpl.setWidth(view, value.toInt())

  override fun setHeight(view: CASNativeAdView, value: Float) =
    NativeAdViewManagerImpl.setHeight(view, value.toInt())

  override fun setBackgroundColor(view: CASNativeAdView, value: Int?) =
    NativeAdViewManagerImpl.setBackgroundColor(view, value)

  override fun setPrimaryColor(view: CASNativeAdView, value: Int?) =
    NativeAdViewManagerImpl.setPrimaryColor(view, value)

  override fun setPrimaryTextColor(view: CASNativeAdView, value: Int?) =
    NativeAdViewManagerImpl.setPrimaryTextColor(view, value)

  override fun setHeadlineTextColor(view: CASNativeAdView, value: Int?) =
    NativeAdViewManagerImpl.setHeadlineTextColor(view, value)

  override fun setHeadlineFontStyle(view: CASNativeAdView, value: String?) =
    NativeAdViewManagerImpl.setHeadlineFontStyle(view, value)

  override fun setSecondaryTextColor(view: CASNativeAdView, value: Int?) =
    NativeAdViewManagerImpl.setSecondaryTextColor(view, value)

  override fun setSecondaryFontStyle(view: CASNativeAdView, value: String?) =
    NativeAdViewManagerImpl.setSecondaryFontStyle(view, value)

  override fun onAfterUpdateTransaction(view: CASNativeAdView) {
    super.onAfterUpdateTransaction(view)
    view.commit()
  }

  override fun onDropViewInstance(view: CASNativeAdView) {
    view.dispose()
    super.onDropViewInstance(view)
  }
}
