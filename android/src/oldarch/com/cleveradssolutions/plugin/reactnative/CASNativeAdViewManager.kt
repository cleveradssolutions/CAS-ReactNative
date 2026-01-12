package com.cleveradssolutions.plugin.reactnative

import android.view.View
import com.cleveradssolutions.plugin.reactnative.native.NativeAdContainer
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

@ReactModule(name = CASMobileAdsModuleImpl.NAME_NATIVE_VIEW)
class CASNativeAdViewManager : ViewGroupManager<NativeAdContainer>() {

  override fun getName(): String = CASMobileAdsModuleImpl.NAME_NATIVE_VIEW

  override fun createViewInstance(ctx: ThemedReactContext): NativeAdContainer {
    return NativeAdContainer(ctx)
  }

  @ReactProp(name = "instanceId")
  fun setInstanceId(view: NativeAdContainer, value: Int) {
    view.instanceId = value
  }

  @ReactProp(name = "width")
  fun setWidth(view: NativeAdContainer, value: Float) {
    view.requiredWidthDp = value.toInt()
  }

  @ReactProp(name = "height")
  fun setHeight(view: NativeAdContainer, value: Float) {
    view.requiredHeightDp = value.toInt()
  }

  @ReactProp(name = "usesTemplate")
  fun setUsesTemplate(view: NativeAdContainer, value: Boolean) {
    view.usesTemplate = value
  }

  @ReactProp(name = "backgroundColor", customType = "Color")
  fun setBackgroundColor(view: NativeAdContainer, value: Int?) {
    view.templateStyle.backgroundColor = value
  }

  @ReactProp(name = "primaryColor", customType = "Color")
  fun setPrimaryColor(view: NativeAdContainer, value: Int?) {
    view.templateStyle.primaryColor = value
  }

  @ReactProp(name = "primaryTextColor", customType = "Color")
  fun setPrimaryTextColor(view: NativeAdContainer, value: Int?) {
    view.templateStyle.primaryTextColor = value
  }

  @ReactProp(name = "headlineTextColor", customType = "Color")
  fun setHeadlineTextColor(view: NativeAdContainer, value: Int?) {
    view.templateStyle.headlineTextColor = value
  }

  @ReactProp(name = "headlineFontStyle")
  fun setHeadlineFontStyle(view: NativeAdContainer, value: String?) {
    view.templateStyle.headlineFontStyle = value
  }

  @ReactProp(name = "secondaryTextColor", customType = "Color")
  fun setSecondaryTextColor(view: NativeAdContainer, value: Int?) {
    view.templateStyle.secondaryTextColor = value
  }

  @ReactProp(name = "secondaryFontStyle")
  fun setSecondaryFontStyle(view: NativeAdContainer, value: String?) {
    view.templateStyle.secondaryFontStyle = value
  }

  override fun addView(parent: NativeAdContainer, child: View, index: Int) {
    parent.addContentChild(child, index)
  }

  override fun getChildCount(parent: NativeAdContainer): Int {
    return parent.getContentChildCount()
  }

  override fun getChildAt(parent: NativeAdContainer, index: Int): View? {
    return parent.getContentChildAt(index)
  }

  override fun removeViewAt(parent: NativeAdContainer, index: Int) {
    parent.removeContentChildAt(index)
  }

  override fun onAfterUpdateTransaction(view: NativeAdContainer) {
    super.onAfterUpdateTransaction(view)
    view.onAfterUpdateTransaction()
  }

  override fun setPadding(
    view: NativeAdContainer,
    left: Int,
    top: Int,
    right: Int,
    bottom: Int
  ) {
    view.setPadding(left, top, right, bottom)
  }

  override fun receiveCommand(
    view: NativeAdContainer,
    commandId: String?,
    args: ReadableArray?
  ) {
    when (commandId) {
      "registerAsset" -> {
        if (args == null || args.size() < 2) return
        val assetType = args.getInt(0)
        val reactTag = args.getInt(1)
        view.registerAdAsset(assetType, reactTag)
      }
    }
  }
}
