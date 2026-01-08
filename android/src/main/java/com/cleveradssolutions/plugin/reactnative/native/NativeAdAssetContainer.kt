package com.cleveradssolutions.plugin.reactnative.native

import android.content.Context
import android.graphics.Color
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import androidx.appcompat.widget.AppCompatButton
import com.cleveradssolutions.sdk.nativead.CASChoicesView
import com.cleveradssolutions.sdk.nativead.CASMediaView
import com.cleveradssolutions.sdk.nativead.CASNativeView
import com.cleveradssolutions.sdk.nativead.CASStarRatingView
import com.facebook.react.views.view.ReactViewGroup

class NativeAdAssetContainer(context: Context) : FrameLayout(context) {
  var assetType: Int = 0

  private val measureAndLayout = Runnable {
    measure(
      MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
    )
    layout(left, top, right, bottom)
  }

  override fun requestLayout() {
    super.requestLayout()
    post(measureAndLayout)
  }

  fun onAfterUpdateTransaction() {
    Log.d(LogTags.ASSET, "onAfterUpdateTransaction")
    if (childCount > 0) return
    val view = when (assetType) {
      NativeAdAssetType.MEDIA -> CASMediaView(context)
      NativeAdAssetType.AD_CHOICES -> CASChoicesView(context)
      NativeAdAssetType.STAR_RATING -> CASStarRatingView(context)
      NativeAdAssetType.ICON -> ImageView(context).also {
        it.scaleType = ImageView.ScaleType.FIT_CENTER
      }

      // Call To Action in JS use Text for visible text and styling.
      // Here we create invisible button to handle clicks in ads.
      // Also Only button should be get mach parent to have same size as JS Text.
      NativeAdAssetType.CALL_TO_ACTION -> Button(context).also {
        it.setBackgroundColor(Color.TRANSPARENT)
        it.setTextColor(Color.TRANSPARENT)
        addView(it, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
        return
      }

      else -> throw Exception("Not supported asset type: $assetType")
    }
    addView(view, LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT))
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()

    // onAfterUpdateTransaction called before attached to parent
    // so we use onAttachedToWindow callback instead
    // This onAttachedToWindow called after NativeAdContainer.onAttachedToWindow()
    var view = parent
    while (view is ViewGroup) {
      if (view is NativeAdContainer) {
        Log.d(LogTags.ASSET, "onAttachedToWindow found parent")
        val assetView = getChildAt(0)
        view.registerAdAsset(assetType, assetView)
        return
      }
      view = view.parent
    }
    Log.d(LogTags.ASSET, "onAttachedToWindow not found parent")
  }

}
