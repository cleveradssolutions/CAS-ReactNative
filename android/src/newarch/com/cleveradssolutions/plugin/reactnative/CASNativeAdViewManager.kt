package com.cleveradssolutions.plugin.reactnative

import android.util.Log
import android.view.View
import com.cleveradssolutions.plugin.reactnative.native.CASNativeAdView
import com.cleveradssolutions.plugin.reactnative.native.LogTags
import com.cleveradssolutions.plugin.reactnative.native.NativeAdViewManagerImpl
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.CASNativeAdViewManagerDelegate
import com.facebook.react.viewmanagers.CASNativeAdViewManagerInterface

@ReactModule(name = NativeAdViewManagerImpl.NAME)
class CASNativeAdViewManager :
  ViewGroupManager<CASNativeAdView>(),
  CASNativeAdViewManagerInterface<CASNativeAdView> {

  private val delegate: ViewManagerDelegate<CASNativeAdView> =
    CASNativeAdViewManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<CASNativeAdView> = delegate
  override fun getName(): String = NativeAdViewManagerImpl.NAME

  override fun createViewInstance(ctx: ThemedReactContext): CASNativeAdView {
    val view = NativeAdViewManagerImpl.createViewInstance(ctx)
    Log.d(LogTags.VIEW, "createViewInstance view=$view")
    return view
  }

  override fun setInstanceId(view: CASNativeAdView, value: Int) =
    NativeAdViewManagerImpl.setInstanceId(view, value)

  override fun setWidth(view: CASNativeAdView, value: Float) =
    NativeAdViewManagerImpl.setWidth(view, value.toInt())

  override fun setHeight(view: CASNativeAdView, value: Float) =
    NativeAdViewManagerImpl.setHeight(view, value.toInt())

  override fun setUsesTemplate(view: CASNativeAdView, value: Boolean) =
    NativeAdViewManagerImpl.setUsesTemplate(view, value)

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

  override fun addView(parent: CASNativeAdView, child: View, index: Int) {
    parent.addAssetChild(child, index)
  }

  override fun getChildCount(parent: CASNativeAdView): Int = parent.getAssetChildCount()

  override fun getChildAt(parent: CASNativeAdView, index: Int): View? =
    parent.getAssetChildAt(index)

  override fun removeViewAt(parent: CASNativeAdView, index: Int) {
    parent.removeAssetChildAt(index)
  }

  override fun onAfterUpdateTransaction(view: CASNativeAdView) {
    super.onAfterUpdateTransaction(view)
    Log.d(LogTags.VIEW, "onAfterUpdateTransaction -> commit view=$view childCount=${view.getAssetChildCount()}")
    view.commit("onAfterUpdateTransaction")
  }

  override fun onDropViewInstance(view: CASNativeAdView) {
    Log.d(LogTags.VIEW, "onDropViewInstance view=$view")
    view.dispose()
    super.onDropViewInstance(view)
  }
}
