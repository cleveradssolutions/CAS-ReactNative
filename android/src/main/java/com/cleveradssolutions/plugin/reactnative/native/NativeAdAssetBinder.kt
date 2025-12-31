package com.cleveradssolutions.plugin.reactnative.native

import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import com.cleveradssolutions.sdk.nativead.CASChoicesView
import com.cleveradssolutions.sdk.nativead.CASMediaView
import com.cleveradssolutions.sdk.nativead.CASNativeView
import com.cleveradssolutions.sdk.nativead.CASStarRatingView

internal object NativeAdAssetBinder {

  private const val ASSET_MIN = 101
  private const val ASSET_MAX = 112
  private fun isAssetType(t: Int) = t in ASSET_MIN..ASSET_MAX

  fun collectPlaceholders(root: View): LinkedHashMap<Int, ViewGroup> {
    val out = LinkedHashMap<Int, ViewGroup>()
    collectInternal(root, out)
    return out
  }

  private fun collectInternal(view: View, out: MutableMap<Int, ViewGroup>) {
    val tag = getAssetTag(view)
    if (tag != null && view is ViewGroup) out[tag] = view
    if (view is ViewGroup) {
      for (i in 0 until view.childCount) collectInternal(view.getChildAt(i), out)
    }
  }

  private fun getAssetTag(view: View): Int? {
    val tagged = view.getTag(NativeAdTags.ASSET_TYPE_KEY) as? Int
    val rawTag = view.tag as? Int
    val tag = tagged ?: rawTag
    return if (tag != null && isAssetType(tag)) tag else null
  }

  fun bindAssets(
    nativeView: CASNativeView,
    placeholders: Map<Int, ViewGroup>,
    views: MutableMap<Int, View>
  ): Boolean {
    if (placeholders.isEmpty()) return false

    var changed = false

    clearRegistered(nativeView)

    val active = placeholders.keys.toSet()
    val it = views.iterator()
    while (it.hasNext()) {
      val (type, v) = it.next()
      if (type !in active) {
        (v.parent as? ViewGroup)?.removeView(v)
        it.remove()
        changed = true
      }
    }

    for ((type, holder) in placeholders) {
      val assetView = views[type] ?: createSdkAssetView(type, holder.context).also {
        it.layoutParams = ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT
        )
        views[type] = it
        changed = true
      }

      if (assetView.parent !== holder) {
        (assetView.parent as? ViewGroup)?.removeView(assetView)
        holder.addView(assetView)
        changed = true
      }

      register(nativeView, type, assetView)
    }

    return changed
  }

  fun unbindAll(nativeView: CASNativeView, views: MutableMap<Int, View>) {
    clearRegistered(nativeView)
    for (v in views.values) (v.parent as? ViewGroup)?.removeView(v)
    views.clear()
  }

  private fun createSdkAssetView(type: Int, context: Context): View {
    return when (type) {
      101 -> TextView(context) // headline
      102 -> CASMediaView(context) // media
      103 -> Button(context) // call to action
      104 -> ImageView(context) // icon
      105 -> TextView(context)  // body
      106 -> TextView(context) // price
      107 -> TextView(context) // advertiser
      108 -> TextView(context) // store
      109 -> CASStarRatingView(context) // star rating
      110 -> TextView(context)  // review count
      111 -> TextView(context) // ad label
      112 -> CASChoicesView(context) // ad choices
      else -> TextView(context)
    }
  }

  private fun clearRegistered(nativeView: CASNativeView) {
    nativeView.headlineView = null
    nativeView.mediaView = null
    nativeView.callToActionView = null
    nativeView.iconView = null
    nativeView.bodyView = null
    nativeView.priceView = null
    nativeView.advertiserView = null
    nativeView.storeView = null
    nativeView.starRatingView = null
    nativeView.reviewCountView = null
    nativeView.adLabelView = null
    nativeView.adChoicesView = null
  }

  private fun register(nativeView: CASNativeView, type: Int, v: View) {
    when (type) {
      101 -> nativeView.headlineView = v as? TextView
      102 -> nativeView.mediaView = v as? CASMediaView
      103 -> nativeView.callToActionView = v as? Button
      104 -> nativeView.iconView = v as? ImageView
      105 -> nativeView.bodyView = v as? TextView
      106 -> nativeView.priceView = v as? TextView
      107 -> nativeView.advertiserView = v as? TextView
      108 -> nativeView.storeView = v as? TextView
      109 -> nativeView.starRatingView = v
      110 -> nativeView.reviewCountView = v as? TextView
      111 -> nativeView.adLabelView = v as? TextView
      112 -> nativeView.adChoicesView = v as? CASChoicesView
    }
  }
}
