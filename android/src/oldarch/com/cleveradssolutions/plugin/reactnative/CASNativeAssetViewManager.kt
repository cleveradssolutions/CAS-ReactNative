package com.cleveradssolutions.plugin.reactnative

import com.cleveradssolutions.plugin.reactnative.native.NativeAdAssetContainer
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

@ReactModule(name = CASMobileAdsModuleImpl.NAME_NATIVE_ASSET)
class CASNativeAssetViewManager : SimpleViewManager<NativeAdAssetContainer>() {

  override fun getName(): String = CASMobileAdsModuleImpl.NAME_NATIVE_ASSET

  override fun createViewInstance(ctx: ThemedReactContext): NativeAdAssetContainer {
    return NativeAdAssetContainer(ctx)
  }

  @ReactProp(name = "assetType")
  fun setAssetType(view: NativeAdAssetContainer, value: Int) {
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
