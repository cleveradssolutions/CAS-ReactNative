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
import type { AppOpenAdType } from '../types/FullscreenAds';
import { addAdEventListener } from '../EventEmitter';

enum AppOpenAdEvent {
  LOADED = 'onAppOpenLoaded',
  FAILED_TO_LOAD = 'onAppOpenFailedToLoad',
  FAILED_TO_SHOW = 'onAppOpenFailedToShow',
  SHOWED = 'onAppOpenShowed',
  CLICKED = 'onAppOpenClicked',
  DISMISSED = 'onAppOpenDismissed',
  IMPRESSION = 'onAppOpenImpression',
}

export const AppOpenAd: AppOpenAdType = {
  isAdLoaded: CASMobileAdsNative.isAppOpenAdLoaded,
  loadAd: CASMobileAdsNative.loadAppOpenAd,
  showAd: CASMobileAdsNative.showAppOpenAd,
  setAutoloadEnabled: CASMobileAdsNative.setAppOpenAutoloadEnabled,
  setAutoshowEnabled: CASMobileAdsNative.setAppOpenAutoshowEnabled,
  destroy: CASMobileAdsNative.destroyAppOpen,

  addAdLoadedEventListener: l => addAdEventListener(AppOpenAdEvent.LOADED, l),
  addAdFailedToLoadEventListener: l => addAdEventListener(AppOpenAdEvent.FAILED_TO_LOAD, l),
  addAdFailedToShowEventListener: l => addAdEventListener(AppOpenAdEvent.FAILED_TO_SHOW, l),
  addAdShowedEventListener: l => addAdEventListener(AppOpenAdEvent.SHOWED, l),
  addAdClickedEventListener: l => addAdEventListener(AppOpenAdEvent.CLICKED, l),
  addAdImpressionEventListener: l => addAdEventListener(AppOpenAdEvent.IMPRESSION, l),
  addAdDismissedEventListener: l => addAdEventListener(AppOpenAdEvent.DISMISSED, l),
};
