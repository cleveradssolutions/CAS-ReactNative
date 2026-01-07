package com.cleveradssolutions.plugin.reactnative.native

import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import com.cleveradssolutions.sdk.nativead.CASNativeView
import com.cleveradssolutions.sdk.nativead.CASStarRatingView
import kotlin.math.roundToInt

internal class NativeTemplateStyle {

  var backgroundColor: Int? = null

  var primaryColor: Int? = null
  var primaryTextColor: Int? = null

  var headlineTextColor: Int? = null
  var headlineFontStyle: String? = null

  var secondaryTextColor: Int? = null
  var secondaryFontStyle: String? = null

  fun applyToView(nativeView: CASNativeView) {
    val density = nativeView.context.resources.displayMetrics.density

    applyBackground(nativeView)
    applyPrimaryColors(nativeView, density)
    applyHeadlineStyle(nativeView)
    applySecondaryStyle(nativeView)

    nativeView.invalidate()
    nativeView.requestLayout()
  }

  private fun applyBackground(nativeView: CASNativeView) {
    val color = backgroundColor ?: return
    if (color != Color.TRANSPARENT) nativeView.setBackgroundColor(color)
  }

  private fun applyPrimaryColors(nativeView: CASNativeView, density: Float) {
    val accentColor = primaryColor
    if (accentColor != null && accentColor != Color.TRANSPARENT) {
      nativeView.adLabelView?.let { label ->
        label.background = createRoundedBorderDrawable(accentColor, density)
        label.setTextColor(accentColor)
      }
      (nativeView.starRatingView as? CASStarRatingView)?.color = accentColor
      nativeView.callToActionView?.background = createRoundedButtonDrawable(accentColor, density)
    }

    val ctaTextColor = primaryTextColor
    if (ctaTextColor != null && ctaTextColor != Color.TRANSPARENT) {
      nativeView.callToActionView?.setTextColor(ctaTextColor)
    }
  }

  private fun applyHeadlineStyle(nativeView: CASNativeView) {
    val headlineView = nativeView.headlineView ?: return
    val textColor = headlineTextColor
    if (textColor != null && textColor != Color.TRANSPARENT) {
      headlineView.setTextColor(textColor)
    }
    val style = headlineFontStyle
    if (!style.isNullOrBlank()) headlineView.typeface = typefaceForStyle(style)
  }

  private fun applySecondaryStyle(nativeView: CASNativeView) {
    val textColor = secondaryTextColor
    if (textColor != null && textColor != Color.TRANSPARENT) {
      nativeView.bodyView?.setTextColor(textColor)
      nativeView.advertiserView?.setTextColor(textColor)
      nativeView.storeView?.setTextColor(textColor)
      nativeView.priceView?.setTextColor(textColor)
      nativeView.reviewCountView?.setTextColor(textColor)
    }

    val style = secondaryFontStyle
    if (!style.isNullOrBlank()) {
      val typeface = typefaceForStyle(style)
      nativeView.bodyView?.typeface = typeface
      nativeView.advertiserView?.typeface = typeface
      nativeView.storeView?.typeface = typeface
      nativeView.priceView?.typeface = typeface
      nativeView.reviewCountView?.typeface = typeface
    }
  }

  private fun typefaceForStyle(style: String): Typeface {
    return when (style.trim().lowercase()) {
      "bold" -> Typeface.DEFAULT_BOLD
      "italic" -> Typeface.defaultFromStyle(Typeface.ITALIC)
      "monospace" -> Typeface.MONOSPACE
      "medium" -> Typeface.create("sans-serif-medium", Typeface.NORMAL)
      else -> Typeface.DEFAULT
    }
  }

  private fun createRoundedButtonDrawable(color: Int, density: Float): GradientDrawable {
    return GradientDrawable().apply {
      shape = GradientDrawable.RECTANGLE
      setColor(color)
      cornerRadius = 20f * density
    }
  }

  private fun createRoundedBorderDrawable(color: Int, density: Float): GradientDrawable {
    return GradientDrawable().apply {
      shape = GradientDrawable.RECTANGLE
      setColor(Color.TRANSPARENT)
      cornerRadius = 2f * density
      setStroke(density.roundToInt(), color)
    }
  }
}
