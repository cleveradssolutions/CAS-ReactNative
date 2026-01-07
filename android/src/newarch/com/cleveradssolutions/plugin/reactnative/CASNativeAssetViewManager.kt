package com.cleveradssolutions.plugin.reactnative

import com.cleveradssolutions.plugin.reactnative.native.CASNativeAssetView
import com.cleveradssolutions.plugin.reactnative.native.NativeAssetViewManagerImpl
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.CASNativeAssetViewManagerDelegate
import com.facebook.react.viewmanagers.CASNativeAssetViewManagerInterface

@ReactModule(name = NativeAssetViewManagerImpl.NAME)
class CASNativeAssetViewManager :
  ViewGroupManager<CASNativeAssetView>(),
  CASNativeAssetViewManagerInterface<CASNativeAssetView> {

  private val delegate: ViewManagerDelegate<CASNativeAssetView> =
    CASNativeAssetViewManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<CASNativeAssetView> = delegate
  override fun getName(): String = NativeAssetViewManagerImpl.NAME

  override fun createViewInstance(ctx: ThemedReactContext): CASNativeAssetView =
    NativeAssetViewManagerImpl.createViewInstance(ctx)

  override fun setAssetType(view: CASNativeAssetView, value: Int) =
    NativeAssetViewManagerImpl.setAssetType(view, value)

  override fun needsCustomLayoutForChildren(): Boolean = false
}
