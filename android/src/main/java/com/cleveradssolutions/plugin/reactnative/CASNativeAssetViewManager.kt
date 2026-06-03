package com.cleveradssolutions.plugin.reactnative

import com.cleveradssolutions.plugin.reactnative.native.NativeAdAssetContainer
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.CASNativeAssetViewManagerDelegate
import com.facebook.react.viewmanagers.CASNativeAssetViewManagerInterface

@ReactModule(name = CASMobileAdsModule.NAME_NATIVE_ASSET)
class CASNativeAssetViewManager : SimpleViewManager<NativeAdAssetContainer>(),
  CASNativeAssetViewManagerInterface<NativeAdAssetContainer> {
  private val delegate = CASNativeAssetViewManagerDelegate(this)

  override fun getName(): String = CASMobileAdsModule.NAME_NATIVE_ASSET
  override fun getDelegate(): ViewManagerDelegate<NativeAdAssetContainer> = delegate

  override fun createViewInstance(ctx: ThemedReactContext): NativeAdAssetContainer =
    NativeAdAssetContainer(ctx)

  @ReactProp(name = "assetType")
  override fun setAssetType(view: NativeAdAssetContainer, value: Int) {
    view.assetType = value
  }

  override fun onAfterUpdateTransaction(view: NativeAdAssetContainer) {
    super.onAfterUpdateTransaction(view)
    view.onAfterUpdateTransaction()
  }

  override fun setPadding(
    view: NativeAdAssetContainer,
    left: Int,
    top: Int,
    right: Int,
    bottom: Int
  ) {
    view.setPadding(left, top, right, bottom)
  }
}
