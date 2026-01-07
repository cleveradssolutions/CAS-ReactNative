package com.cleveradssolutions.plugin.reactnative.native

import android.content.Context
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import com.cleveradssolutions.sdk.nativead.CASChoicesView
import com.cleveradssolutions.sdk.nativead.CASMediaView
import com.cleveradssolutions.sdk.nativead.CASStarRatingView

class CASNativeAssetView(context: Context) : FrameLayout(context) {

  private var inner: View? = null

  fun getSdkView(): View? = inner

  var assetType: Int = 0
    set(value) {
      if (field == value) return

      if (field != 0 && value != field) {
        Log.w(LogTags.ASSET, "assetType change ignored: old=$field new=$value view=$this")
        return
      }

      field = value
      Log.d(LogTags.ASSET, "set assetType=$value view=$this parent=$parent")
      ensureInner(value)
      notifyParentCommit()
    }

  private fun ensureInner(type: Int) {
    val newInner = createSdkAssetView(type, context)

    val old = inner
    if (old != null && old::class == newInner::class) return

    removeAllViews()
    addView(newInner, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    inner = newInner

    requestLayout()
    invalidate()
  }

  private fun createSdkAssetView(type: Int, ctx: Context): View {
    return when (type) {
      NativeAdAssetType.HEADLINE,
      NativeAdAssetType.BODY,
      NativeAdAssetType.PRICE,
      NativeAdAssetType.ADVERTISER,
      NativeAdAssetType.STORE,
      NativeAdAssetType.REVIEW_COUNT,
      NativeAdAssetType.AD_LABEL -> CASNativeTextAssetView(ctx)

      NativeAdAssetType.MEDIA -> CASMediaView(ctx)
      NativeAdAssetType.CALL_TO_ACTION -> Button(ctx)
      NativeAdAssetType.ICON -> ImageView(ctx).apply { scaleType = ImageView.ScaleType.CENTER_CROP }
      NativeAdAssetType.STAR_RATING -> CASStarRatingView(ctx)
      NativeAdAssetType.AD_CHOICES -> CASChoicesView(ctx)
      else -> View(ctx)
    }
  }

  private fun notifyParentCommit() {
    var p = parent
    while (p is View) {
      if (p is CASNativeAdView) {
        Log.d(LogTags.ASSET, "notify parent commit from assetType=$assetType view=$this")
        p.commit("assetTypeChanged($assetType)")
        return
      }
      p = p.parent
    }
  }
}
