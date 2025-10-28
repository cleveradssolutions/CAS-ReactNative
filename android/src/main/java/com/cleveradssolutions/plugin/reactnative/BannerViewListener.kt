package com.cleveradssolutions.plugin.reactnative

import android.view.View
import com.cleveradssolutions.sdk.AdContentInfo
import com.cleveradssolutions.sdk.OnAdImpressionListener
import com.cleversolutions.ads.AdError
import com.cleversolutions.ads.AdViewListener
import com.cleversolutions.ads.android.CASBannerView
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import kotlin.math.roundToInt


class BannerViewListener(
  val context: ThemedReactContext
) : AdViewListener, OnAdImpressionListener {
  var viewId: Int = View.NO_ID
  var isAutoloadEnabled = true
  var isWaitOfLoad = true

  override fun onAdViewLoaded(view: CASBannerView) {
    val adSize = view.size
    var dpW = adSize.width
    var dpH = adSize.height
    val density = view.context.resources.displayMetrics.density
    view.getChildAt(0)?.layoutParams?.let {
      dpW = (it.width / density).roundToInt()
      dpH = (it.height / density).roundToInt()
    }

    val widthPX = (dpW * density + 0.5).roundToInt()
    val heightPX = (dpH * density + 0.5).roundToInt()
    val widthSpec = View.MeasureSpec.makeMeasureSpec(widthPX, View.MeasureSpec.EXACTLY)
    val heightSpec = View.MeasureSpec.makeMeasureSpec(heightPX, View.MeasureSpec.EXACTLY)

    view.measure(widthSpec, heightSpec)
    view.layout(view.left, view.top, view.left + widthPX, view.top + heightPX)

    val map = WritableNativeMap().apply {
      putInt("width", dpW)
      putInt("height", dpH)
    }
    emitAdEvent("onAdViewLoaded", map)
  }

  override fun onAdViewFailed(view: CASBannerView, error: AdError) {
    val sizeSpec = View.MeasureSpec.makeMeasureSpec(1, View.MeasureSpec.EXACTLY)
    view.measure(sizeSpec, sizeSpec)
    view.layout(view.left, view.top, view.left + 1, view.top + 1)

    val map = WritableNativeMap().apply {
      putInt("code", error.code)
      putString("message", error.message)
    }
    emitAdEvent("onAdViewFailed", map)
  }

  override fun onAdImpression(ad: AdContentInfo) {
    emitAdEvent("onAdViewImpression", ad.toWritableMap())
  }

  override fun onAdViewClicked(view: CASBannerView) {
    emitAdEvent("onAdViewClicked", WritableNativeMap())
  }

  private fun emitAdEvent(name: String, map: WritableMap?) {
    context.getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(viewId, name, map)
  }
}
