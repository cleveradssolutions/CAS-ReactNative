package com.cleveradssolutions.plugin.reactnative.native

import android.content.Context
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

  var assetType: Int = 0
    set(value) {
      if (field == value) return
      field = value
      ensureInner(value)
      notifyParentCommit()
    }

  private fun ensureInner(type: Int) {
    val newInner = createSdkAssetView(type, context)
    newInner.tag = type

    val old = inner
    if (old != null && old::class == newInner::class) {
      old.tag = type
      return
    }

    removeAllViews()
    addView(
      newInner,
      LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    )
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
      NativeAdAssetType.AD_LABEL -> TextView(ctx)
      NativeAdAssetType.MEDIA -> CASMediaView(ctx)
      NativeAdAssetType.CALL_TO_ACTION -> Button(ctx)
      NativeAdAssetType.ICON -> ImageView(ctx).apply {
        scaleType = ImageView.ScaleType.CENTER_CROP
      }
      NativeAdAssetType.STAR_RATING -> CASStarRatingView(ctx)
      NativeAdAssetType.AD_CHOICES -> CASChoicesView(ctx)

      else -> View(ctx)
    }
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
