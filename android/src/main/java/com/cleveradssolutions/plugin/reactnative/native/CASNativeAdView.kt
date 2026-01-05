package com.cleveradssolutions.plugin.reactnative.native

import android.content.Context
import android.view.View
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import com.cleveradssolutions.sdk.nativead.CASChoicesView
import com.cleveradssolutions.sdk.nativead.CASMediaView
import com.cleveradssolutions.sdk.nativead.CASNativeView
import com.cleveradssolutions.sdk.nativead.CASStarRatingView
import com.cleveradssolutions.sdk.nativead.NativeAdContent
import com.cleversolutions.ads.AdSize
import com.facebook.react.views.view.ReactViewGroup
import androidx.core.view.isNotEmpty

class CASNativeAdView(context: Context) : ReactViewGroup(context) {

  private val nativeView = CASNativeView(context)
  internal val reactContainer = ReactViewGroup(context)

  var instanceId: Int = -1
    set(value) {
      if (field == value) return
      field = value
      lastAdRef = null
      scheduleApply()
    }

  var widthDp: Int = 0
    set(value) {
      field = value
      scheduleApply()
    }

  var heightDp: Int = 0
    set(value) {
      field = value
      scheduleApply()
    }

  var usesTemplate: Boolean = false
    set(value) {
      if (field == value) return
      field = value
      lastAdRef = null
      scheduleApply()
    }

  var templateBackgroundColor: Int? = null
  var templatePrimaryColor: Int? = null
  var templatePrimaryTextColor: Int? = null
  var templateHeadlineTextColor: Int? = null
  var templateHeadlineFontStyle: String? = null
  var templateSecondaryTextColor: Int? = null
  var templateSecondaryFontStyle: String? = null

  private val templateStyle = NativeTemplateStyle()

  private var lastAdRef: NativeAdContent? = null
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

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    scheduleApply()
  }

  fun commit() = scheduleApply()

  fun dispose() {
    nativeView.setNativeAd(null)
    lastAdRef = null
    applyPosted = false
    lastTemplateW = 0
    lastTemplateH = 0
    clearRegisteredAssets()
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

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    super.onMeasure(widthMeasureSpec, heightMeasureSpec)
    val w = measuredWidth
    val h = measuredHeight
    nativeView.measure(
      MeasureSpec.makeMeasureSpec(w, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(h, MeasureSpec.EXACTLY)
    )
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    val w = r - l
    val h = b - t
    nativeView.layout(0, 0, w, h)
  }

  private fun scheduleApply() {
    if (applyPosted) return
    applyPosted = true
    post(::applyNow)
  }

  private fun applyNow() {
    applyPosted = false
    if (!isAttachedToWindow) return

    val ad = if (instanceId >= 0) NativeAdStore.find(instanceId) else null
    if (ad == null) {
      if (lastAdRef != null) nativeView.setNativeAd(null)
      lastAdRef = null
      return
    }

    val hasChildren = reactContainer.isNotEmpty()
    if (usesTemplate && !hasChildren) {
      val (wDp, hDp) = resolveTemplateSizeDp()
      if (wDp > 0 && hDp > 0 && (lastTemplateW != wDp || lastTemplateH != hDp)) {
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

    registerAssets()

    lastAdRef = ad
    nativeView.setNativeAd(ad)

    applyTemplateStyle()
  }

  private fun resolveTemplateSizeDp(): Pair<Int, Int> {
    val density = resources.displayMetrics.density
    val wDp = if (widthDp > 0) widthDp else (measuredWidth / density).toInt()
    val hDp = if (heightDp > 0) heightDp else (measuredHeight / density).toInt()
    return wDp to hDp
  }

  private fun registerAssets() {
    nativeView.headlineView = findAssetByTag(NativeAdAssetType.HEADLINE) as? TextView
    nativeView.mediaView = findAssetByTag(NativeAdAssetType.MEDIA) as? CASMediaView
    nativeView.callToActionView = findAssetByTag(NativeAdAssetType.CALL_TO_ACTION) as? Button
    nativeView.iconView = findAssetByTag(NativeAdAssetType.ICON) as? ImageView
    nativeView.bodyView = findAssetByTag(NativeAdAssetType.BODY) as? TextView
    nativeView.priceView = findAssetByTag(NativeAdAssetType.PRICE) as? TextView
    nativeView.advertiserView = findAssetByTag(NativeAdAssetType.ADVERTISER) as? TextView
    nativeView.storeView = findAssetByTag(NativeAdAssetType.STORE) as? TextView
    nativeView.starRatingView = findAssetByTag(NativeAdAssetType.STAR_RATING) as? CASStarRatingView
    nativeView.reviewCountView = findAssetByTag(NativeAdAssetType.REVIEW_COUNT) as? TextView
    nativeView.adLabelView = findAssetByTag(NativeAdAssetType.AD_LABEL) as? TextView
    nativeView.adChoicesView = findAssetByTag(NativeAdAssetType.AD_CHOICES) as? CASChoicesView
  }

  private fun clearRegisteredAssets() {
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

  private fun findAssetByTag(tag: Int): View? =
    reactContainer.findViewWithTag(tag)

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
