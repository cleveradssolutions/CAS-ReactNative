package com.cleveradssolutions.plugin.reactnative.native

import android.content.Context
import android.view.View
import android.widget.FrameLayout
import com.cleveradssolutions.sdk.nativead.CASNativeView
import com.cleveradssolutions.sdk.nativead.NativeAdContent
import com.cleversolutions.ads.AdSize
import com.facebook.react.views.view.ReactViewGroup

class CASNativeAdView(context: Context) : ReactViewGroup(context) {

  private val nativeView = CASNativeView(context)
  internal val reactContainer = ReactViewGroup(context)

  var instanceId: Int = -1
  var widthDp: Int = 0
  var heightDp: Int = 0
  var usesTemplate: Boolean = false

  var templateBackgroundColor: Int? = null
  var templatePrimaryColor: Int? = null
  var templatePrimaryTextColor: Int? = null
  var templateHeadlineTextColor: Int? = null
  var templateHeadlineFontStyle: String? = null
  var templateSecondaryTextColor: Int? = null
  var templateSecondaryFontStyle: String? = null

  private val templateStyle = NativeTemplateStyle()

  private var appliedInstanceId: Int = Int.MIN_VALUE
  private var lastAdRef: NativeAdContent? = null
  private var unsubscribe: (() -> Unit)? = null

  private val sdkViews = HashMap<Int, View>()

  private var applyPosted = false
  private var lastTemplateW = 0
  private var lastTemplateH = 0

  init {
    addView(nativeView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    nativeView.addView(
      reactContainer,
      FrameLayout.LayoutParams(
        FrameLayout.LayoutParams.MATCH_PARENT,
        FrameLayout.LayoutParams.MATCH_PARENT
      )
    )
  }

  fun addAssetChild(child: View, index: Int) {
    reactContainer.addView(child, index.coerceIn(0, reactContainer.childCount))
    scheduleApply()
  }

  fun getAssetChildCount(): Int = reactContainer.childCount
  fun getAssetChildAt(index: Int): View? =
    if (index in 0 until reactContainer.childCount) reactContainer.getChildAt(index) else null

  fun removeAssetChildAt(index: Int) {
    if (index !in 0 until reactContainer.childCount) return
    reactContainer.removeViewAt(index)
    scheduleApply()
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    scheduleApply()
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    unsubscribe?.invoke()
    unsubscribe = null
  }

  fun commit() = scheduleApply()

  fun dispose() {
    unsubscribe?.invoke()
    unsubscribe = null

    nativeView.setNativeAd(null)
    lastAdRef = null
    appliedInstanceId = Int.MIN_VALUE

    lastTemplateW = 0
    lastTemplateH = 0

    NativeAdAssetBinder.unbindAll(nativeView, sdkViews)
  }

  private fun scheduleApply() {
    if (applyPosted) return
    applyPosted = true
    post(::applyNow)
  }

  private fun applyNow() {
    applyPosted = false
    if (!isAttachedToWindow) return

    updateSubscription()

    val ad = resolveAdOrClear() ?: return

    val placeholders = NativeAdAssetBinder.collectPlaceholders(reactContainer)
    if (placeholders.isNotEmpty()) {
      val changed = NativeAdAssetBinder.bindAssets(nativeView, placeholders, sdkViews)

      val needSet = (lastAdRef !== ad) || changed
      if (needSet) {
        lastAdRef = ad
        nativeView.setNativeAd(ad)
      }

      applyTemplateStyle()
      return
    }

    if (usesTemplate) {
      val (wDp, hDp) = resolveTemplateSizeDp()
      if (wDp <= 0 || hDp <= 0) {
        requestLayout()
        scheduleApply()
        return
      }

      if (lastTemplateW != wDp || lastTemplateH != hDp) {
        lastTemplateW = wDp
        lastTemplateH = hDp
        nativeView.setAdTemplateSize(AdSize.getInlineBanner(wDp, hDp))
      }

      if (lastAdRef !== ad) {
        lastAdRef = ad
        nativeView.setNativeAd(ad)
      }

      applyTemplateStyle()
      return
    }
    
    NativeAdAssetBinder.unbindAll(nativeView, sdkViews)
    if (lastAdRef != null) {
      nativeView.setNativeAd(null)
      lastAdRef = null
    }
  }

  private fun updateSubscription() {
    if (appliedInstanceId == instanceId) return

    appliedInstanceId = instanceId
    lastAdRef = null
    lastTemplateW = 0
    lastTemplateH = 0

    unsubscribe?.invoke()
    unsubscribe = null

    if (instanceId >= 0) {
      unsubscribe = NativeAdStore.subscribe(instanceId) { scheduleApply() }
    }
  }

  private fun resolveAdOrClear(): NativeAdContent? {
    val ad = if (appliedInstanceId >= 0) NativeAdStore.find(appliedInstanceId) else null
    if (ad == null) {
      nativeView.setNativeAd(null)
      lastAdRef = null
      lastTemplateW = 0
      lastTemplateH = 0
      NativeAdAssetBinder.unbindAll(nativeView, sdkViews)
      return null
    }
    return ad
  }

  private fun resolveTemplateSizeDp(): Pair<Int, Int> {
    val density = resources.displayMetrics.density
    val wDp = if (widthDp > 0) widthDp else (measuredWidth / density).toInt()
    val hDp = if (heightDp > 0) heightDp else (measuredHeight / density).toInt()
    return wDp to hDp
  }

  private fun applyTemplateStyle() {
    templateStyle.backgroundColor = templateBackgroundColor
    templateStyle.primaryColor = templatePrimaryColor
    templateStyle.primaryTextColor = templatePrimaryTextColor
    templateStyle.headlineTextColor = templateHeadlineTextColor
    templateStyle.headlineFontStyle = templateHeadlineFontStyle
    templateStyle.secondaryTextColor = templateSecondaryTextColor
    templateStyle.secondaryFontStyle = templateSecondaryFontStyle
    templateStyle.applyToView(nativeView)
  }
}
