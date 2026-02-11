package com.cleveradssolutions.plugin.reactnative

import android.util.Log
import android.view.View
import com.cleveradssolutions.plugin.reactnative.native.NativeAdContainer
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.CASNativeAdViewManagerDelegate
import com.facebook.react.viewmanagers.CASNativeAdViewManagerInterface
import com.facebook.react.views.text.ReactTextViewManager

@ReactModule(name = CASMobileAdsModuleImpl.NAME_NATIVE_VIEW)
class CASNativeAdViewManager :
  ViewGroupManager<NativeAdContainer>(),
  CASNativeAdViewManagerInterface<NativeAdContainer> {

  private val delegate: ViewManagerDelegate<NativeAdContainer> =
    CASNativeAdViewManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<NativeAdContainer> = delegate
  override fun getName(): String = CASMobileAdsModuleImpl.NAME_NATIVE_VIEW

  override fun createViewInstance(ctx: ThemedReactContext): NativeAdContainer =
    NativeAdContainer(ctx)

  override fun setInstanceId(view: NativeAdContainer, value: Int) {
    view.instanceId = value
  }

  override fun setWidth(view: NativeAdContainer, value: Float) {
    view.requiredWidthDp = value.toInt()
  }

  override fun setHeight(view: NativeAdContainer, value: Float) {
    view.requiredHeightDp = value.toInt()
  }

  override fun setUsesTemplate(view: NativeAdContainer, value: Boolean) {
    view.usesTemplate = value
  }

  override fun setBackgroundColor(view: NativeAdContainer, value: Int?) {
    view.templateStyle.backgroundColor = value
  }

  override fun setPrimaryColor(view: NativeAdContainer, value: Int?) {
    view.templateStyle.primaryColor = value
  }

  override fun setPrimaryTextColor(view: NativeAdContainer, value: Int?) {
    view.templateStyle.primaryTextColor = value
  }

  override fun setHeadlineTextColor(view: NativeAdContainer, value: Int?) {
    view.templateStyle.headlineTextColor = value
  }

  override fun setHeadlineFontStyle(view: NativeAdContainer, value: String?) {
    view.templateStyle.headlineFontStyle = value
  }

  override fun setSecondaryTextColor(view: NativeAdContainer, value: Int?) {
    view.templateStyle.secondaryTextColor = value
  }

  override fun setSecondaryFontStyle(view: NativeAdContainer, value: String?) {
    view.templateStyle.secondaryFontStyle = value
  }

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
