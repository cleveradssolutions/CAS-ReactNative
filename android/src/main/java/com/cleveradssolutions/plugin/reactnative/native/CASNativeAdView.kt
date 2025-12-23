package com.cleveradssolutions.plugin.reactnative.native

import android.content.Context
import android.view.View
import android.widget.FrameLayout
import com.cleveradssolutions.sdk.nativead.CASNativeView
import com.cleveradssolutions.sdk.nativead.NativeAdContent
import com.cleversolutions.ads.AdSize
import kotlin.math.roundToInt

class CASNativeAdView(context: Context) : FrameLayout(context) {

  private var casNativeView: CASNativeView? = null

  var instanceId: Int = -1
  var widthDp: Int = 0
  var heightDp: Int = 0

  private var appliedInstanceId: Int = Int.MIN_VALUE
  private var appliedWidthDp: Int = Int.MIN_VALUE
  private var appliedHeightDp: Int = Int.MIN_VALUE

  private var boundAd: NativeAdContent? = null
  private var unsubscribeFromStore: (() -> Unit)? = null

  private val style = NativeTemplateStyle()

  fun setBackgroundColorProp(value: Int?) { style.backgroundColor = value }
  fun setPrimaryColorProp(value: Int?) { style.primaryColor = value }
  fun setPrimaryTextColorProp(value: Int?) { style.primaryTextColor = value }
  fun setHeadlineTextColorProp(value: Int?) { style.headlineTextColor = value }
  fun setHeadlineFontStyleProp(value: String?) { style.headlineFontStyle = value }
  fun setSecondaryTextColorProp(value: Int?) { style.secondaryTextColor = value }
  fun setSecondaryFontStyleProp(value: String?) { style.secondaryFontStyle = value }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    post(::apply)
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    unsubscribeFromStore?.invoke()
    unsubscribeFromStore = null
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    val w = widthDp
    val h = heightDp
    if (w > 0 && h > 0) {
      val density = resources.displayMetrics.density
      val desiredWpx = (w * density + 0.5f).roundToInt()
      val desiredHpx = (h * density + 0.5f).roundToInt()

      val resolvedWpx = resolveSize(desiredWpx, widthMeasureSpec)
      val resolvedHpx = resolveSize(desiredHpx, heightMeasureSpec)

      setMeasuredDimension(resolvedWpx, resolvedHpx)
      return
    }
    super.onMeasure(widthMeasureSpec, heightMeasureSpec)
  }

  fun commit() {
    post(::apply)
  }

  fun dispose() {
    unsubscribeFromStore?.invoke()
    unsubscribeFromStore = null

    casNativeView?.setNativeAd(null)
    boundAd = null

    appliedInstanceId = Int.MIN_VALUE
    appliedWidthDp = Int.MIN_VALUE
    appliedHeightDp = Int.MIN_VALUE
  }

  private fun getOrCreateNativeView(): CASNativeView {
    val existing = casNativeView
    if (existing != null) return existing

    val created = CASNativeView(context)
    casNativeView = created
    addView(created, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    return created
  }

  private fun recreateNativeView(): CASNativeView {
    casNativeView?.let { removeView(it) }

    val created = CASNativeView(context)
    casNativeView = created
    addView(created, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    appliedWidthDp = Int.MIN_VALUE
    appliedHeightDp = Int.MIN_VALUE
    return created
  }

  private fun forceExactMeasureAndLayout(view: View) {
    val w = widthDp
    val h = heightDp
    if (w <= 0 || h <= 0) return

    val density = resources.displayMetrics.density
    val wPx = (w * density + 0.5f).roundToInt()
    val hPx = (h * density + 0.5f).roundToInt()

    val wSpec = MeasureSpec.makeMeasureSpec(wPx, MeasureSpec.EXACTLY)
    val hSpec = MeasureSpec.makeMeasureSpec(hPx, MeasureSpec.EXACTLY)

    view.measure(wSpec, hSpec)
    view.layout(0, 0, wPx, hPx)
    measure(wSpec, hSpec)
    layout(left, top, left + wPx, top + hPx)
  }

  private fun apply() {
    if (!isAttachedToWindow) return

    val w = widthDp
    val h = heightDp
    if (w <= 0 || h <= 0) {
      requestLayout()
      return
    }

    if (appliedInstanceId != instanceId) {
      appliedInstanceId = instanceId
      boundAd = null

      unsubscribeFromStore?.invoke()
      unsubscribeFromStore = null

      if (instanceId >= 0) {
        unsubscribeFromStore = NativeAdStore.subscribe(instanceId) {
          post(::apply)
        }
      }
    }

    val ad = if (appliedInstanceId >= 0) NativeAdStore.find(appliedInstanceId) else null
    if (ad == null) {
      val view = getOrCreateNativeView()
      view.setNativeAd(null)
      style.applyToView(view)
      forceExactMeasureAndLayout(view)
      return
    }

    val view = if (boundAd !== ad) {
      boundAd = ad
      recreateNativeView()
    } else {
      getOrCreateNativeView()
    }

    if (appliedWidthDp != w || appliedHeightDp != h) {
      appliedWidthDp = w
      appliedHeightDp = h
      view.setAdTemplateSize(AdSize.getInlineBanner(w, h))
    }

    view.setNativeAd(ad)
    style.applyToView(view)
    forceExactMeasureAndLayout(view)
  }
}
