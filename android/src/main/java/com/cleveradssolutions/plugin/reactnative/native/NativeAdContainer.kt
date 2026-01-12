package com.cleveradssolutions.plugin.reactnative.native

import android.annotation.SuppressLint
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import com.cleveradssolutions.plugin.reactnative.BuildConfig
import com.cleveradssolutions.sdk.nativead.CASChoicesView
import com.cleveradssolutions.sdk.nativead.CASMediaView
import com.cleveradssolutions.sdk.nativead.CASNativeView
import com.cleversolutions.ads.AdSize
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.views.view.ReactViewGroup

@SuppressLint("ViewConstructor")
class NativeAdContainer(context: ReactContext) : FrameLayout(context) {

  /**
   * We need React styling support for the container,
   * so we want to use ReactViewGroup.
   */
  private val adView = CASNativeView(context)

  /**
   * All native ad asset views must be children of CASNativeView.
   * However, CASNativeView does not support index-based child view handling
   * as required by React Native.
   * Therefore, we create a ReactViewGroup container for react native views.
   */
  val container = ReactViewGroup(context)

  var instanceId: Int = -1
  var requiredWidthDp: Int = 0
  var requiredHeightDp: Int = 0
  var usesTemplate: Boolean = false
  private var lastBoundWidth = -1
  private var lastBoundHeight = -1
  private var lastBoundInstanceId = -1

  internal val templateStyle = NativeTemplateStyle()

  /**
   * Avoid set multiple native ads by checking the ID of the last instance.
   */
  private var lastInstanceId: Int = -2

  /**
   * Check last template size to refresh Ad content after template size changed.
   */
  private var lastTemplateSize: AdSize? = null

  private val mainThread = Handler(Looper.getMainLooper())
  private val updateAdContentRunnable = Runnable {
    updateAdContent()
  }

  private val measureAndLayout = Runnable {
    measure(
      MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
    )
    layout(left, top, right, bottom)
  }

  var assetType: Int = 0

  init {
    addView(adView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    adView.addView(container, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }

  override fun requestLayout() {
    super.requestLayout()
    post(measureAndLayout)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    delayUpdateAdContent()
  }

  fun onAfterUpdateTransaction() {
    if (usesTemplate) {
      // If JS not specify template size then use Medium rectangle by default
      val templateSize = if (requiredWidthDp == 0 || requiredHeightDp == 0)
        AdSize.MEDIUM_RECTANGLE
      else
        AdSize.getInlineBanner(requiredWidthDp, requiredHeightDp)

      if (lastTemplateSize != templateSize) {
        adView.setAdTemplateSize(templateSize)

        lastTemplateSize = templateSize
        // Reset last instance id to refresh ad content after template size changed.
        lastInstanceId = -1
      }
    }

    if (isAttachedToWindow) {
      delayUpdateAdContent()
    }
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    if (isAttachedToWindow) delayUpdateAdContent()
  }

  fun addContentChild(child: View, index: Int) {
    container.addView(child, index)
  }

  fun getContentChildCount(): Int = container.childCount

  fun getContentChildAt(index: Int): View? =
    container.getChildAt(index)

  fun removeContentChildAt(index: Int) {
    container.removeViewAt(index)
  }

  fun registerAdAsset(assetType: Int, reactTag: Int) {
    val uiManager = UIManagerHelper.getUIManagerForReactTag(context as ReactContext, reactTag)
    val assetView = uiManager?.resolveView(reactTag) ?: return
    registerAdAsset(assetType, assetView)
  }

  fun registerAdAsset(assetType: Int, assetView: View) {
    when (assetType) {
      NativeAdAssetType.HEADLINE -> adView.headlineView = assetView as TextView
      NativeAdAssetType.BODY -> adView.bodyView = assetView as TextView
      NativeAdAssetType.ADVERTISER -> adView.advertiserView = assetView as TextView
      NativeAdAssetType.PRICE -> adView.priceView = assetView as TextView
      NativeAdAssetType.STORE -> adView.storeView = assetView as TextView
      NativeAdAssetType.REVIEW_COUNT -> adView.reviewCountView = assetView as TextView
      NativeAdAssetType.AD_LABEL -> adView.adLabelView = assetView as TextView
      NativeAdAssetType.MEDIA -> adView.mediaView = assetView as CASMediaView
      NativeAdAssetType.AD_CHOICES -> adView.adChoicesView = assetView as CASChoicesView
      // STAR_RATING is TextView or CASStarRatingView
      NativeAdAssetType.STAR_RATING -> adView.starRatingView = assetView
      NativeAdAssetType.ICON -> adView.iconView = assetView as ImageView
      NativeAdAssetType.CALL_TO_ACTION -> adView.callToActionView = assetView as Button

      else -> throw Exception("Not supported asset type: $assetType")
    }

    delayUpdateAdContent()
  }

  private fun delayUpdateAdContent() {
    mainThread.removeCallbacks(updateAdContentRunnable)
    mainThread.postDelayed(updateAdContentRunnable, 100)
  }

  private fun updateAdContent() {
    templateStyle.applyToView(adView)

    val nativeAd = NativeAdStore.find(instanceId)
    if (nativeAd == null) {
      val error = "Not found Native Ad with instance id: $instanceId"
      if (BuildConfig.DEBUG) throw Exception(error) else Log.e("CAS.AI", error)
      return
    }

    val sizeChanged = (width != lastBoundWidth || height != lastBoundHeight)
    val instanceChanged = (instanceId != lastInstanceId)

    if (instanceChanged) {
      adView.setNativeAd(nativeAd)
      lastInstanceId = instanceId
      lastBoundWidth = width
      lastBoundHeight = height
      lastBoundInstanceId = instanceId

      return
    }

    if (sizeChanged && lastBoundInstanceId == instanceId) {
      adView.setNativeAd(nativeAd)
      lastBoundWidth = width
      lastBoundHeight = height
    }
  }

}
