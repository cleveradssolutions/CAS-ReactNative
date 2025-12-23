package com.cleveradssolutions.plugin.reactnative.native

import com.facebook.react.uimanager.ThemedReactContext

object NativeAdViewManagerImpl {
  const val NAME = "CASNativeAdView"

  fun createViewInstance(ctx: ThemedReactContext): CASNativeAdView =
    CASNativeAdView(ctx)

  fun setInstanceId(view: CASNativeAdView, value: Int) { view.instanceId = value }
  fun setWidth(view: CASNativeAdView, value: Int) { view.widthDp = value }
  fun setHeight(view: CASNativeAdView, value: Int) { view.heightDp = value }

  fun setBackgroundColor(view: CASNativeAdView, value: Int?) = view.setBackgroundColorProp(value)
  fun setPrimaryColor(view: CASNativeAdView, value: Int?) = view.setPrimaryColorProp(value)
  fun setPrimaryTextColor(view: CASNativeAdView, value: Int?) = view.setPrimaryTextColorProp(value)
  fun setHeadlineTextColor(view: CASNativeAdView, value: Int?) = view.setHeadlineTextColorProp(value)
  fun setHeadlineFontStyle(view: CASNativeAdView, value: String?) = view.setHeadlineFontStyleProp(value)
  fun setSecondaryTextColor(view: CASNativeAdView, value: Int?) = view.setSecondaryTextColorProp(value)
  fun setSecondaryFontStyle(view: CASNativeAdView, value: String?) = view.setSecondaryFontStyleProp(value)
}
