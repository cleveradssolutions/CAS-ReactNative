package com.cas.extensions

import com.cleversolutions.ads.AdsSettings
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap

fun AdsSettings.toReadableMap(): ReadableMap {
  val map = WritableNativeMap()

  map.putInt("taggedAudience", this.taggedAudience)
  map.putInt("ccpaStatus", this.ccpaStatus)
  map.putBoolean("debugMode", this.debugMode)
  map.putBoolean("allowInterstitialAdsWhenVideoCostAreLower", this.allowInterstitialAdsWhenVideoCostAreLower)
  map.putInt("bannerRefreshInterval", this.bannerRefreshInterval)
  map.putInt("interstitialInterval", this.interstitialInterval)
  map.putInt("loadingMode", this.loadingMode)
  map.putBoolean("mutedAdSounds", this.mutedAdSounds)
  map.putInt("userConsent", this.userConsent)
  map.putBoolean("deprecated_analyticsCollectionEnabled", this.analyticsCollectionEnabled)

  val array = WritableNativeArray()

  this.testDeviceIDs.forEach {
    array.pushString(it)
  }

  map.putArray("testDeviceIDs", array)

  return map
}

fun AdsSettings.fromReadableMap(map: ReadableMap) {
  map.has("taggedAudience") {
    this.taggedAudience = map.getInt("taggedAudience")
  }

  map.has("ccpaStatus") {
    this.ccpaStatus = map.getInt("ccpaStatus")
  }

  map.has("debugMode") {
    this.debugMode = map.getBoolean("debugMode")
  }

  map.has("allowInterstitialAdsWhenVideoCostAreLower") {
    this.allowInterstitialAdsWhenVideoCostAreLower = map.getBoolean("allowInterstitialAdsWhenVideoCostAreLower")
  }

  map.has("bannerRefreshInterval") {
    this.bannerRefreshInterval = map.getInt("bannerRefreshInterval")
  }

  map.has("interstitialInterval") {
    this.interstitialInterval = map.getInt("interstitialInterval")
  }

  map.has("loadingMode") {
    this.loadingMode = map.getInt("loadingMode")
  }

  map.has("mutedAdSounds") {
    this.mutedAdSounds = map.getBoolean("mutedAdSounds")
  }

  map.has("userConsent") {
    this.userConsent = map.getInt("userConsent")
  }

  map.has("deprecated_analyticsCollectionEnabled") {
    this.analyticsCollectionEnabled = map.getBoolean("deprecated_analyticsCollectionEnabled")
  }

  map.getArray("testDeviceIDs")?.let {
    this.testDeviceIDs = it.toArrayList().toSet() as? Set<String> ?: setOf()
  }
}
