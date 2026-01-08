package com.cleveradssolutions.plugin.reactnative.native

import android.annotation.SuppressLint
import android.graphics.Color
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import androidx.core.os.postDelayed
import com.cleveradssolutions.plugin.reactnative.BuildConfig
import com.cleveradssolutions.sdk.base.CASHandler
import com.cleveradssolutions.sdk.base.CASJob
import com.cleveradssolutions.sdk.nativead.CASChoicesView
import com.cleveradssolutions.sdk.nativead.CASMediaView
import com.cleveradssolutions.sdk.nativead.CASNativeView
import com.cleveradssolutions.sdk.nativead.CASStarRatingView
import com.cleversolutions.ads.AdSize
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.views.text.ReactTextView
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

  internal val templateStyle = NativeTemplateStyle()

  /**
   * Avoid set multiple native ads by checking the ID of the last instance.
   */
  private var lastInstanceId: Int = -2

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

  init {
    addView(adView)
    adView.addView(container)
  }

  override fun requestLayout() {
    super.requestLayout()
    post(measureAndLayout)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    Log.d(LogTags.VIEW, "onAttachedToWindow view=$this size=${width}x${height}")

    delayUpdateAdContent()
  }

  fun onAfterUpdateTransaction() {
    Log.d(LogTags.VIEW, "onAfterUpdateTransaction")
    if (usesTemplate) {
      // Can be called multiple times with same size without regeneration views.
      val templateSize = AdSize.getInlineBanner(requiredWidthDp, requiredHeightDp)
      Log.d(LogTags.VIEW, "setAdTemplateSize $templateSize")
      adView.setAdTemplateSize(templateSize)
    }

    if (isAttachedToWindow) {
      delayUpdateAdContent()
    }
  }

  fun addContentChild(child: View, index: Int) {
    Log.d(
      LogTags.VIEW,
      "addAssetChild index=$index child=${child::class.java.simpleName} view=$this"
    )
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
    Log.d(LogTags.VIEW, "Register asset type $assetType")

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
      NativeAdAssetType.STAR_RATING -> adView.starRatingView = assetView as CASStarRatingView
      NativeAdAssetType.ICON -> adView.iconView = assetView as ImageView
      NativeAdAssetType.CALL_TO_ACTION -> adView.callToActionView = assetView as Button

      else -> throw Exception("Not supported asset type: $assetType")
    }

    delayUpdateAdContent()
  }

  private fun delayUpdateAdContent() {
    Log.d(LogTags.VIEW, "delayUpdateAdContent")
    mainThread.removeCallbacks(updateAdContentRunnable)
    mainThread.postDelayed(updateAdContentRunnable, 100)
  }

  private fun updateAdContent() {
    Log.d(
      LogTags.VIEW,
      "updateAdContent() instanceId=$instanceId usesTemplate=$usesTemplate " +
        "childCount=${container.childCount} viewSize=${width}x${height} nativeSize=${adView.width}x${adView.height} view=$this"
    )

    templateStyle.applyToView(adView)

    if (!usesTemplate) {
      logRegisteredAssets()
    }

    if (instanceId != lastInstanceId) {
      val nativeAd = NativeAdStore.find(instanceId)
      if (nativeAd == null) {
        val error = "Not found Native Ad with instance id: $instanceId"
        if (BuildConfig.DEBUG)
          throw Exception(error)
        else
          Log.e("CAS.AI", error)
        return
      }
      Log.d(LogTags.VIEW, "applyNow -> setNativeAd(ad) view=$this")
      adView.setNativeAd(nativeAd)
      lastInstanceId = instanceId
    }
  }

  private fun logRegisteredAssets() {
    if (!BuildConfig.DEBUG) return
    Log.d(
      LogTags.VIEW,
      buildString {
        append("assets registered view=$this\n")
        append(" headline=${adView.headlineView?.javaClass?.simpleName}\n")
        append(" body=${adView.bodyView?.javaClass?.simpleName}\n")
        append(" cta=${adView.callToActionView?.javaClass?.simpleName}\n")
        append(" media=${adView.mediaView?.javaClass?.simpleName}\n")
        append(" icon=${adView.iconView?.javaClass?.simpleName}\n")
        append(" advertiser=${adView.advertiserView?.javaClass?.simpleName}\n")
        append(" store=${adView.storeView?.javaClass?.simpleName}\n")
        append(" price=${adView.priceView?.javaClass?.simpleName}\n")
        append(" star=${adView.starRatingView?.javaClass?.simpleName}\n")
        append(" reviewCount=${adView.reviewCountView?.javaClass?.simpleName}\n")
        append(" adLabel=${adView.adLabelView?.javaClass?.simpleName}\n")
        append(" adChoices=${adView.adChoicesView?.javaClass?.simpleName}\n")
      }
    )
  }

}
