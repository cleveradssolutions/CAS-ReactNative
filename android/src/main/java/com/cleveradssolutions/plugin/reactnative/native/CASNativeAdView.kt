package com.cleveradssolutions.plugin.reactnative.native

import android.content.Context
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.core.view.isNotEmpty
import com.cleveradssolutions.sdk.nativead.CASChoicesView
import com.cleveradssolutions.sdk.nativead.CASMediaView
import com.cleveradssolutions.sdk.nativead.CASNativeView
import com.cleveradssolutions.sdk.nativead.CASStarRatingView
import com.cleveradssolutions.sdk.nativead.NativeAdContent
import com.cleversolutions.ads.AdSize
import com.facebook.react.views.view.ReactViewGroup


class CASNativeAdView(context: Context) : ReactViewGroup(context) {

  private val nativeView = CASNativeView(context)
  internal val reactContainer = ReactViewGroup(context)

  var instanceId: Int = -1
    set(value) {
      if (field == value) return
      field = value
      Log.d(LogTags.VIEW, "set instanceId=$value view=$this")
      lastAdRef = null
      assetsVersion++
      scheduleApply("instanceIdChanged")
    }

  var widthDp: Int = 0
    set(value) {
      field = value
      scheduleApply("widthDpChanged")
    }

  var heightDp: Int = 0
    set(value) {
      field = value
      scheduleApply("heightDpChanged")
    }

  var usesTemplate: Boolean = false
    set(value) {
      if (field == value) return
      field = value
      Log.d(LogTags.VIEW, "set usesTemplate=$value view=$this")
      lastAdRef = null
      assetsVersion++
      scheduleApply("usesTemplateChanged")
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
  private var lastCommitReason: String = "init"

  private var assetsVersion: Int = 0
  private var lastBoundAssetsVersion: Int = -1

  init {
    Log.d(LogTags.VIEW, "init view=$this")
    addView(nativeView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))

    nativeView.addView(
      reactContainer,
      ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    )
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    super.onMeasure(widthMeasureSpec, heightMeasureSpec)

    val w = MeasureSpec.getSize(widthMeasureSpec)
    val h = MeasureSpec.getSize(heightMeasureSpec)

    val childW = MeasureSpec.makeMeasureSpec(w, MeasureSpec.EXACTLY)
    val childH = MeasureSpec.makeMeasureSpec(h, MeasureSpec.EXACTLY)
    nativeView.measure(childW, childH)

    setMeasuredDimension(w, h)
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    val w = r - l
    val h = b - t
    nativeView.layout(0, 0, w, h)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    Log.d(LogTags.VIEW, "onAttachedToWindow view=$this size=${width}x${height}")
    scheduleApply("onAttachedToWindow")
  }

  override fun onDetachedFromWindow() {
    Log.d(LogTags.VIEW, "onDetachedFromWindow view=$this")
    super.onDetachedFromWindow()
  }

  fun commit(reason: String = "commit") {
    lastCommitReason = reason
    Log.d(LogTags.VIEW, "commit(reason=$reason) view=$this")
    scheduleApply(reason)
  }

  fun dispose() {
    Log.d(LogTags.VIEW, "dispose view=$this")
    nativeView.setNativeAd(null)
    lastAdRef = null
    applyPosted = false
    lastTemplateW = 0
    lastTemplateH = 0
    lastBoundAssetsVersion = -1
    clearRegisteredAssets()
  }

  fun addAssetChild(child: View, index: Int) {
    Log.d(LogTags.VIEW, "addAssetChild index=$index child=${child::class.java.simpleName} view=$this")
    reactContainer.addView(child, index.coerceIn(0, reactContainer.childCount))
    assetsVersion++
    scheduleApply("addChild")
  }

  fun getAssetChildCount(): Int = reactContainer.childCount

  fun getAssetChildAt(index: Int): View? =
    if (index in 0 until reactContainer.childCount) reactContainer.getChildAt(index) else null

  fun removeAssetChildAt(index: Int) {
    if (index !in 0 until reactContainer.childCount) return
    val child = reactContainer.getChildAt(index)
    Log.d(LogTags.VIEW, "removeAssetChildAt index=$index child=${child::class.java.simpleName} view=$this")
    reactContainer.removeViewAt(index)
    assetsVersion++
    scheduleApply("removeChild")
  }

  private fun scheduleApply(reason: String) {
    lastCommitReason = reason
    if (applyPosted) return
    applyPosted = true
    post(::applyNow)
  }

  private fun applyNow() {
    applyPosted = false
    if (!isAttachedToWindow) return

    Log.d(
      LogTags.VIEW,
      "applyNow(reason=$lastCommitReason) instanceId=$instanceId usesTemplate=$usesTemplate " +
        "childCount=${reactContainer.childCount} viewSize=${width}x${height} nativeSize=${nativeView.width}x${nativeView.height} view=$this"
    )

    val ad = if (instanceId >= 0) NativeAdStore.find(instanceId) else null
    if (ad == null) {
      if (lastAdRef != null) {
        Log.d(LogTags.VIEW, "applyNow -> setNativeAd(null) (ad missing) view=$this")
        nativeView.setNativeAd(null)
      }
      lastAdRef = null
      lastBoundAssetsVersion = -1
      clearRegisteredAssets()
      return
    }

    val hasChildren = reactContainer.isNotEmpty()

    if (usesTemplate && !hasChildren) {
      val (wDp, hDp) = resolveTemplateSizeDp()
      if (wDp > 0 && hDp > 0 && (lastTemplateW != wDp || lastTemplateH != hDp)) {
        lastTemplateW = wDp
        lastTemplateH = hDp
        Log.d(LogTags.VIEW, "applyNow -> setAdTemplateSize ${wDp}x${hDp}dp view=$this")
        nativeView.setAdTemplateSize(AdSize.getInlineBanner(wDp, hDp))
      }

      if (lastAdRef !== ad) {
        Log.d(LogTags.VIEW, "applyNow -> setNativeAd(ad) TEMPLATE view=$this")
        lastAdRef = ad
        nativeView.setNativeAd(ad)
      }

      applyTemplateStyle()
      return
    }

    registerAssetsWithLogs()

    val needRebind = (lastAdRef !== ad) || (lastBoundAssetsVersion != assetsVersion)
    if (needRebind) {
      Log.d(
        LogTags.VIEW,
        "applyNow -> setNativeAd(ad) CUSTOM rebind=" +
          "${lastAdRef !== ad} assetsChanged=${lastBoundAssetsVersion != assetsVersion} " +
          "(assetsVersion=$assetsVersion lastBound=$lastBoundAssetsVersion) view=$this"
      )
      lastAdRef = ad
      lastBoundAssetsVersion = assetsVersion
      nativeView.setNativeAd(ad)
    } else {
      Log.d(LogTags.VIEW, "applyNow -> skip setNativeAd (same ad & assets) view=$this")
    }

    applyTemplateStyle()
  }

  private fun resolveTemplateSizeDp(): Pair<Int, Int> {
    val density = resources.displayMetrics.density
    val wDp = if (widthDp > 0) widthDp else (measuredWidth / density).toInt()
    val hDp = if (heightDp > 0) heightDp else (measuredHeight / density).toInt()
    return wDp to hDp
  }

  private fun registerAssetsWithLogs() {
    clearRegisteredAssets()

    nativeView.headlineView = findTextAsset(NativeAdAssetType.HEADLINE)
    nativeView.bodyView = findTextAsset(NativeAdAssetType.BODY)
    nativeView.priceView = findTextAsset(NativeAdAssetType.PRICE)
    nativeView.advertiserView = findTextAsset(NativeAdAssetType.ADVERTISER)
    nativeView.storeView = findTextAsset(NativeAdAssetType.STORE)
    nativeView.reviewCountView = findTextAsset(NativeAdAssetType.REVIEW_COUNT)
    nativeView.adLabelView = findTextAsset(NativeAdAssetType.AD_LABEL)

    nativeView.mediaView = findAssetSdkView(NativeAdAssetType.MEDIA) as? CASMediaView
    nativeView.callToActionView = findAssetSdkView(NativeAdAssetType.CALL_TO_ACTION) as? Button
    nativeView.iconView = findAssetSdkView(NativeAdAssetType.ICON) as? ImageView
    nativeView.starRatingView = findAssetSdkView(NativeAdAssetType.STAR_RATING) as? CASStarRatingView
    nativeView.adChoicesView = findAssetSdkView(NativeAdAssetType.AD_CHOICES) as? CASChoicesView

    Log.d(
      LogTags.VIEW,
      buildString {
        append("assets registered view=$this\n")
        append(" headline=${nativeView.headlineView?.javaClass?.simpleName}\n")
        append(" body=${nativeView.bodyView?.javaClass?.simpleName}\n")
        append(" cta=${nativeView.callToActionView?.javaClass?.simpleName}\n")
        append(" media=${nativeView.mediaView?.javaClass?.simpleName}\n")
        append(" icon=${nativeView.iconView?.javaClass?.simpleName}\n")
        append(" advertiser=${nativeView.advertiserView?.javaClass?.simpleName}\n")
        append(" store=${nativeView.storeView?.javaClass?.simpleName}\n")
        append(" price=${nativeView.priceView?.javaClass?.simpleName}\n")
        append(" star=${nativeView.starRatingView?.javaClass?.simpleName}\n")
        append(" reviewCount=${nativeView.reviewCountView?.javaClass?.simpleName}\n")
        append(" adLabel=${nativeView.adLabelView?.javaClass?.simpleName}\n")
        append(" adChoices=${nativeView.adChoicesView?.javaClass?.simpleName}\n")
      }
    )
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

  private fun findTextAsset(assetType: Int): TextView? {
    val direct = findAssetSdkViewRecursive(reactContainer, assetType, preferText = true)
    if (direct is TextView) return direct

    val any = findAssetSdkViewRecursive(reactContainer, assetType, preferText = false)
    return any as? TextView
  }

  private fun findAssetSdkView(assetType: Int): View? {
    return findAssetSdkViewRecursive(reactContainer, assetType, preferText = false)
  }

  private fun findAssetSdkViewRecursive(view: View, assetType: Int, preferText: Boolean): View? {
    if (view is CASNativeTextAssetView && view.assetType == assetType) {
      Log.d(LogTags.VIEW, "found TEXT assetType=$assetType -> ${view::class.java.simpleName} view=$view")
      return view
    }

    if (!preferText) {
      if (view is CASNativeAssetView && view.assetType == assetType) {
        val sdk = view.getSdkView()
        Log.d(
          LogTags.VIEW,
          "found ASSET assetType=$assetType -> holder=${view::class.java.simpleName} sdk=${sdk?.javaClass?.simpleName}"
        )
        return sdk
      }
    }

    if (view is ViewGroup) {
      for (i in 0 until view.childCount) {
        val found = findAssetSdkViewRecursive(view.getChildAt(i), assetType, preferText)
        if (found != null) return found
      }
    }

    return null
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

    Log.d(
      LogTags.VIEW,
      "applyTemplateStyle view=$this bg=$templateBackgroundColor primary=$templatePrimaryColor primaryText=$templatePrimaryTextColor"
    )
  }
}
