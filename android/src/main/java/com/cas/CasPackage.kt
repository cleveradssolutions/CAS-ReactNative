package com.cas

import com.cas.views.*
import com.cas.extensions.MediationManagerWrapper
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager


class CasPackage : ReactPackage {
  private val managerWrapper = MediationManagerWrapper()

  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(
      CasModule(reactContext, managerWrapper),
      MediationManagerModule(reactContext, managerWrapper)
    )
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return listOf(BannerAdViewManager(managerWrapper))
  }
}
