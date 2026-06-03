package com.cleveradssolutions.plugin.reactnative

import android.view.View
import com.cleveradssolutions.plugin.reactnative.native.NativeAdContainer
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.CASNativeAdViewManagerDelegate
import com.facebook.react.viewmanagers.CASNativeAdViewManagerInterface

@ReactModule(name = CASMobileAdsModule.NAME_NATIVE_VIEW)
class CASNativeAdViewManager : ViewGroupManager<NativeAdContainer>(),
  CASNativeAdViewManagerInterface<NativeAdContainer> {

  private val delegate = CASNativeAdViewManagerDelegate(this)

  override fun getName(): String = CASMobileAdsModule.NAME_NATIVE_VIEW
  override fun getDelegate(): ViewManagerDelegate<NativeAdContainer> = delegate
  override fun receiveCommand(view: NativeAdContainer, commandId: String, args: ReadableArray?) {
    delegate.receiveCommand(view, commandId, args)
  }

  override fun createViewInstance(ctx: ThemedReactContext): NativeAdContainer =
    NativeAdContainer(ctx)

  @ReactProp(name = "instanceId")
  override fun setInstanceId(view: NativeAdContainer, value: Int) {
    view.instanceId = value
  }

  @ReactProp(name = "width")
  override fun setWidth(view: NativeAdContainer, value: Float) {
    if (!value.isNaN()) {
      view.requiredWidthDp = value.toInt()
    }
  }

  @ReactProp(name = "height")
  override fun setHeight(view: NativeAdContainer, value: Float) {
    if (!value.isNaN()) {
      view.requiredHeightDp = value.toInt()
    }
  }

  @ReactProp(name = "usesTemplate")
  override fun setUsesTemplate(view: NativeAdContainer, value: Boolean) {
    view.usesTemplate = value
  }

  @ReactProp(name = "backgroundColor", customType = "Color")
  override fun setBackgroundColor(view: NativeAdContainer, value: Int?) {
    view.templateStyle.backgroundColor = value
  }

  @ReactProp(name = "primaryColor", customType = "Color")
  override fun setPrimaryColor(view: NativeAdContainer, value: Int?) {
    view.templateStyle.primaryColor = value
  }

  @ReactProp(name = "primaryTextColor", customType = "Color")
  override fun setPrimaryTextColor(view: NativeAdContainer, value: Int?) {
    view.templateStyle.primaryTextColor = value
  }

  @ReactProp(name = "headlineTextColor", customType = "Color")
  override fun setHeadlineTextColor(view: NativeAdContainer, value: Int?) {
    view.templateStyle.headlineTextColor = value
  }

  @ReactProp(name = "headlineFontStyle")
  override fun setHeadlineFontStyle(view: NativeAdContainer, value: String?) {
    view.templateStyle.headlineFontStyle = value
  }

  @ReactProp(name = "secondaryTextColor", customType = "Color")
  override fun setSecondaryTextColor(view: NativeAdContainer, value: Int?) {
    view.templateStyle.secondaryTextColor = value
  }

  @ReactProp(name = "secondaryFontStyle")
  override fun setSecondaryFontStyle(view: NativeAdContainer, value: String?) {
    view.templateStyle.secondaryFontStyle = value
  }

  @ReactMethod
  override fun registerAsset(view: NativeAdContainer?, assetType: Int, reactTag: Int) {
    view?.registerAdAsset(assetType, reactTag)
  }

  override fun addView(parent: NativeAdContainer, child: View, index: Int) {
    parent.addContentChild(child, index)
  }

  override fun getChildCount(parent: NativeAdContainer): Int =
    parent.getContentChildCount()

  override fun getChildAt(parent: NativeAdContainer, index: Int): View? =
    parent.getContentChildAt(index)

  override fun removeViewAt(parent: NativeAdContainer, index: Int) {
    parent.removeContentChildAt(index)
  }

  override fun onAfterUpdateTransaction(view: NativeAdContainer) {
    super.onAfterUpdateTransaction(view)
    view.onAfterUpdateTransaction()
  }

  override fun setPadding(view: NativeAdContainer, left: Int, top: Int, right: Int, bottom: Int) {
    view.setPadding(left, top, right, bottom)
  }
}
