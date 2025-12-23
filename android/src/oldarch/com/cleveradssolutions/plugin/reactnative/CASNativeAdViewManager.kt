package com.cleveradssolutions.plugin.reactnative

import com.cleveradssolutions.plugin.reactnative.native.CASNativeAdView
import com.cleveradssolutions.plugin.reactnative.native.NativeAdViewManagerImpl
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

@ReactModule(name = NativeAdViewManagerImpl.NAME)
class CASNativeAdViewManager : SimpleViewManager<CASNativeAdView>() {

  override fun getName() = NativeAdViewManagerImpl.NAME

  override fun createViewInstance(ctx: ThemedReactContext) =
    NativeAdViewManagerImpl.createViewInstance(ctx)

  @ReactProp(name = "instanceId")
  fun setInstanceId(view: CASNativeAdView, value: Int) =
    NativeAdViewManagerImpl.setInstanceId(view, value)

  @ReactProp(name = "width")
  fun setWidth(view: CASNativeAdView, value: Int) =
    NativeAdViewManagerImpl.setWidth(view, value)

  @ReactProp(name = "height")
  fun setHeight(view: CASNativeAdView, value: Int) =
    NativeAdViewManagerImpl.setHeight(view, value)

  @ReactProp(name = "backgroundColor", customType = "Color")
  fun setBackgroundColor(view: CASNativeAdView, value: Int?) =
    NativeAdViewManagerImpl.setBackgroundColor(view, value)

  @ReactProp(name = "primaryColor", customType = "Color")
  fun setPrimaryColor(view: CASNativeAdView, value: Int?) =
    NativeAdViewManagerImpl.setPrimaryColor(view, value)

  @ReactProp(name = "primaryTextColor", customType = "Color")
  fun setPrimaryTextColor(view: CASNativeAdView, value: Int?) =
    NativeAdViewManagerImpl.setPrimaryTextColor(view, value)

  @ReactProp(name = "headlineTextColor", customType = "Color")
  fun setHeadlineTextColor(view: CASNativeAdView, value: Int?) =
    NativeAdViewManagerImpl.setHeadlineTextColor(view, value)

  @ReactProp(name = "headlineFontStyle")
  fun setHeadlineFontStyle(view: CASNativeAdView, value: String?) =
    NativeAdViewManagerImpl.setHeadlineFontStyle(view, value)

  @ReactProp(name = "secondaryTextColor", customType = "Color")
  fun setSecondaryTextColor(view: CASNativeAdView, value: Int?) =
    NativeAdViewManagerImpl.setSecondaryTextColor(view, value)

  @ReactProp(name = "secondaryFontStyle")
  fun setSecondaryFontStyle(view: CASNativeAdView, value: String?) =
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
