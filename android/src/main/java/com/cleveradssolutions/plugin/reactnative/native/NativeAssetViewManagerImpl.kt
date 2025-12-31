package com.cleveradssolutions.plugin.reactnative.native

import com.facebook.react.uimanager.ThemedReactContext

object NativeAssetViewManagerImpl {
  const val NAME = "CASNativeAssetView"

  fun createViewInstance(ctx: ThemedReactContext): CASNativeAssetView = CASNativeAssetView(ctx)

  fun setAssetType(view: CASNativeAssetView, value: Int) {
    view.assetType = value
  }

}
