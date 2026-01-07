package com.cleveradssolutions.plugin.reactnative.native

import com.facebook.react.uimanager.ThemedReactContext

object NativeTextAssetViewManagerImpl {

  const val NAME = "CASNativeTextAssetView"

  fun createViewInstance(ctx: ThemedReactContext): CASNativeTextAssetView {
    return CASNativeTextAssetView(ctx)
  }

  fun setAssetType(view: CASNativeTextAssetView, value: Int) {
    view.assetType = value
  }
}
