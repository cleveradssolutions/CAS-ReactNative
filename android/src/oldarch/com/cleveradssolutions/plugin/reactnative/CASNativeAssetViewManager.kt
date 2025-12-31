package com.cleveradssolutions.plugin.reactnative

import com.cleveradssolutions.plugin.reactnative.native.CASNativeAssetView
import com.cleveradssolutions.plugin.reactnative.native.NativeAssetViewManagerImpl
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

@ReactModule(name = NativeAssetViewManagerImpl.NAME)
class CASNativeAssetViewManager : SimpleViewManager<CASNativeAssetView>() {

  override fun getName() = NativeAssetViewManagerImpl.NAME

  override fun createViewInstance(ctx: ThemedReactContext) =
    NativeAssetViewManagerImpl.createViewInstance(ctx)

  @ReactProp(name = "assetType")
  fun setAssetType(view: CASNativeAssetView, value: Int) =
    NativeAssetViewManagerImpl.setAssetType(view, value)
}
