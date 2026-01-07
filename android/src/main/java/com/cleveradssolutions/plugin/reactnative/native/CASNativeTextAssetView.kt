package com.cleveradssolutions.plugin.reactnative.native

import android.annotation.SuppressLint
import android.content.Context
import android.util.Log
import android.view.View
import android.view.ViewParent
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.views.text.ReactTextView

@SuppressLint("ViewConstructor")
class CASNativeTextAssetView(context: Context) : ReactTextView(context) {

  var assetType: Int = -1
    set(value) {
      if (field == value) return
      field = value
      Log.d("CASNativeTextAsset", "set assetType=$value view=$this parent=$parent")
      findParentAdView()?.commit("assetType(text)")
    }

  private fun findParentAdView(): CASNativeAdView? {
    var p: ViewParent? = parent
    while (p is View) {
      if (p is CASNativeAdView) return p
      p = p.parent
    }
    return null
  }

  private fun notifyParentCommit() {
    var p = parent
    while (p is View) {
      if (p is CASNativeAdView) {
        Log.d(LogTags.TEXT_ASSET, "notify parent commit from assetType=$assetType view=$this")
        p.commit("textAssetTypeChanged($assetType)")
        return
      }
      p = p.parent
    }
  }
}
