package com.cleveradssolutions.plugin.reactnative.native

import android.content.Context
import android.view.View
import com.facebook.react.views.view.ReactViewGroup

class CASNativeAssetView(context: Context) : ReactViewGroup(context) {

  var assetType: Int = 0
    set(value) {
      field = value
      tag = value
      setTag(NativeAdTags.ASSET_TYPE_KEY, value)
      notifyParentCommit()
    }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    notifyParentCommit()
  }

  override fun onViewAdded(child: View) {
    super.onViewAdded(child)
    notifyParentCommit()
  }

  override fun onViewRemoved(child: View) {
    super.onViewRemoved(child)
    notifyParentCommit()
  }

  private fun notifyParentCommit() {
    var p = parent
    while (p is View) {
      if (p is CASNativeAdView) {
        p.commit()
        return
      }
      p = p.parent
    }
  }
}
