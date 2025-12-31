package com.cleveradssolutions.plugin.reactnative.native

import com.facebook.react.uimanager.ThemedReactContext

object NativeAdViewManagerImpl {
  const val NAME = "CASNativeAdView"

  fun createViewInstance(ctx: ThemedReactContext): CASNativeAdView = CASNativeAdView(ctx)

  fun setInstanceId(view: CASNativeAdView, value: Int) { view.instanceId = value }
  fun setWidth(view: CASNativeAdView, value: Int) { view.widthDp = value }
  fun setHeight(view: CASNativeAdView, value: Int) { view.heightDp = value }
  fun setUsesTemplate(view: CASNativeAdView, value: Boolean) { view.usesTemplate = value }

  fun setBackgroundColor(view: CASNativeAdView, value: Int?) { view.templateBackgroundColor = value }
  fun setPrimaryColor(view: CASNativeAdView, value: Int?) { view.templatePrimaryColor = value }
  fun setPrimaryTextColor(view: CASNativeAdView, value: Int?) { view.templatePrimaryTextColor = value }
  fun setHeadlineTextColor(view: CASNativeAdView, value: Int?) { view.templateHeadlineTextColor = value }
  fun setHeadlineFontStyle(view: CASNativeAdView, value: String?) { view.templateHeadlineFontStyle = value }
  fun setSecondaryTextColor(view: CASNativeAdView, value: Int?) { view.templateSecondaryTextColor = value }
  fun setSecondaryFontStyle(view: CASNativeAdView, value: String?) { view.templateSecondaryFontStyle = value }
}
