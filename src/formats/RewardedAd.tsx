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
import type { RewardedAdType } from '../types/FullscreenAds';
import { addAdEventListener } from '../EventEmitter';

const enum RewardedAdEvent {
  LOADED = 'onRewardedLoaded',
  FAILED_TO_LOAD = 'onRewardedFailedToLoad',
  FAILED_TO_SHOW = 'onRewardedFailedToShow',
  SHOWED = 'onRewardedShowed',
  CLICKED = 'onRewardedClicked',
  IMPRESSION = 'onRewardedImpression',
  REWARD = 'onRewardedCompleted',
  DISMISSED = 'onRewardedDismissed',
}

export const RewardedAd: RewardedAdType = {
  isAdLoaded: CASMobileAdsNative.isRewardedAdLoaded,
  loadAd: CASMobileAdsNative.loadRewardedAd,
  showAd: CASMobileAdsNative.showRewardedAd,
  setAutoloadEnabled: CASMobileAdsNative.setRewardedAutoloadEnabled,
  destroy: CASMobileAdsNative.destroyRewarded,

  addAdUserEarnRewardEventListener: l => addAdEventListener(RewardedAdEvent.REWARD, l),
  addAdLoadedEventListener: l => addAdEventListener(RewardedAdEvent.LOADED, l),
  addAdFailedToLoadEventListener: l => addAdEventListener(RewardedAdEvent.FAILED_TO_LOAD, l),
  addAdClickedEventListener: l => addAdEventListener(RewardedAdEvent.CLICKED, l),
  addAdShowedEventListener: l => addAdEventListener(RewardedAdEvent.SHOWED, l),
  addAdFailedToShowEventListener: l => addAdEventListener(RewardedAdEvent.FAILED_TO_SHOW, l),
  addAdDismissedEventListener: l => addAdEventListener(RewardedAdEvent.DISMISSED, l),
  addAdImpressionEventListener: l => addAdEventListener(RewardedAdEvent.IMPRESSION, l),
};
