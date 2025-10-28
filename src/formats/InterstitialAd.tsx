/*
 * Copyright 2025 CleverAdsSolutions LTD, CAS.AI
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import CASMobileAdsNative from '../modules/NativeCASMobileAdsModule';
import type { InterstitialAdType } from '../types/FullscreenAds';
import { addAdEventListener } from '../EventEmitter';

enum InterstitialAdEvent {
  LOADED = 'onInterstitialLoaded',
  FAILED_TO_LOAD = 'onInterstitialFailedToLoad',
  FAILED_TO_SHOW = 'onInterstitialFailedToShow',
  SHOWED = 'onInterstitialShowed',
  CLICKED = 'onInterstitialClicked',
  DISMISSED = 'onInterstitialDismissed',
  IMPRESSION = 'onInterstitialImpression',
}

export const InterstitialAd: InterstitialAdType = {
  isAdLoaded: CASMobileAdsNative.isInterstitialAdLoaded,
  loadAd: CASMobileAdsNative.loadInterstitialAd,
  showAd: CASMobileAdsNative.showInterstitialAd,

  setAutoloadEnabled: CASMobileAdsNative.setInterstitialAutoloadEnabled,
  setAutoshowEnabled: CASMobileAdsNative.setInterstitialAutoshowEnabled,
  setMinInterval: CASMobileAdsNative.setInterstitialMinInterval,
  restartInterval: CASMobileAdsNative.restartInterstitialInterval,
  destroy: CASMobileAdsNative.destroyInterstitial,

  addAdLoadedEventListener: l => addAdEventListener(InterstitialAdEvent.LOADED, l),
  addAdFailedToLoadEventListener: l => addAdEventListener(InterstitialAdEvent.FAILED_TO_LOAD, l),
  addAdClickedEventListener: l => addAdEventListener(InterstitialAdEvent.CLICKED, l),
  addAdShowedEventListener: l => addAdEventListener(InterstitialAdEvent.SHOWED, l),
  addAdFailedToShowEventListener: l => addAdEventListener(InterstitialAdEvent.FAILED_TO_SHOW, l),
  addAdDismissedEventListener: l => addAdEventListener(InterstitialAdEvent.DISMISSED, l),
  addAdImpressionEventListener: l => addAdEventListener(InterstitialAdEvent.IMPRESSION, l),
};
