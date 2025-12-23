package com.cleveradssolutions.plugin.reactnative

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class CasPackage : TurboReactPackage() {

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return listOf(
      CASMobileAdsViewManager(),
      CASNativeAdViewManager()
    )
  }

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == CASMobileAdsModuleImpl.NAME) {
      CASMobileAdsModule(reactContext)
    } else null
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
    val name = CASMobileAdsModuleImpl.NAME
    val isTurbo = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
    hashMapOf(
      name to ReactModuleInfo(
        name,
        name,
        false,
        false,
        false,
        false,
        isTurbo
      )
    )
  }
}
