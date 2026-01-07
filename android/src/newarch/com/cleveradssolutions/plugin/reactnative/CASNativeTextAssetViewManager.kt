package com.cleveradssolutions.plugin.reactnative

import com.cleveradssolutions.plugin.reactnative.native.CASNativeTextAssetView
import com.cleveradssolutions.plugin.reactnative.native.NativeTextAssetViewManagerImpl
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.CASNativeTextAssetViewManagerDelegate
import com.facebook.react.viewmanagers.CASNativeTextAssetViewManagerInterface

@ReactModule(name = NativeTextAssetViewManagerImpl.NAME)
class CASNativeTextAssetViewManager :
  SimpleViewManager<CASNativeTextAssetView>(),
  CASNativeTextAssetViewManagerInterface<CASNativeTextAssetView> {

  private val delegate: ViewManagerDelegate<CASNativeTextAssetView> =
    CASNativeTextAssetViewManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<CASNativeTextAssetView> = delegate
  override fun getName(): String = NativeTextAssetViewManagerImpl.NAME

  override fun createViewInstance(ctx: ThemedReactContext): CASNativeTextAssetView =
    NativeTextAssetViewManagerImpl.createViewInstance(ctx)

  override fun setAssetType(view: CASNativeTextAssetView, value: Int) =
    NativeTextAssetViewManagerImpl.setAssetType(view, value)
}
