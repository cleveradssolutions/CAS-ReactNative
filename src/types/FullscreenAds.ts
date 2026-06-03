/*
 * Copyright 2026 CleverAdsSolutions LTD, CAS.AI
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

import type { AdError, AdContentInfo } from './AdContent';

export type Unsubscribe = () => void;

/**
 * Public interfaces for fullscreen ad surfaces.
 * Each function mirrors a native command or emits a native event.
 *
 * Events:
 * - Loaded / FailedToLoad: fired after `loadAd()`
 * - Showed / FailedToShow / Dismissed / Clicked: lifecycle of `showAd()`
 * - Impression: contains parsed revenue/partner payload (see AdContentInfo)
 */
export type FullscreenAdBase = {
  /**
   * An optional placement name for the ad instance that helps categorize
   * and track statistics across different ad placements.
   * Maximum 100 characters allowed for the placement name.
   */
  setPlacement(placement: string | null): void;

  /**
   * Enables automatic loading of the next ad.
   * When enabled, the SDK loads a new ad after dismissal and retries on load errors.
   */
  setAutoloadEnabled(enabled: boolean): void;

  /**
   * Indicates whether the ad is currently loaded and ready to be shown.
   */
  isAdLoaded(): Promise<boolean>;

  /**
   * Manual retry to load the ad.
   * If autoload is enabled, loading/retry happens automatically when needed.
   */
  loadAd(): void;

  /**
   * Display this ad on top of the application.
   * Register event listeners before calling to get lifecycle callbacks.
   */
  showAd(): void;

  /**
   * Frees the underlying native resources.
   */
  destroy(): void;

  /**
   * Called when an ad is successfully loaded.
   */
  addAdLoadedEventListener(l: () => void): Unsubscribe;

  /**
   * Called when an ad load failed.
   */
  addAdFailedToLoadEventListener(l: (error: AdError) => void): Unsubscribe;

  /**
   * Called when the ad failed to show full screen content.
   */
  addAdFailedToShowEventListener(l: (error: AdError) => void): Unsubscribe;

  /**
   * Called when the ad showed the full screen content.
   */
  addAdShowedEventListener(l: () => void): Unsubscribe;

  /**
   * Called when a click is recorded for an ad.
   */
  addAdClickedEventListener(l: () => void): Unsubscribe;

  /**
   * Called when an impression occurs on the ad.
   */
  addAdImpressionEventListener(l: (info: AdContentInfo) => void): Unsubscribe;

  /**
   * Called when the ad dismissed full screen content.
   */
  addAdDismissedEventListener(l: () => void): Unsubscribe;
};

/** AppOpen ads specific options. */
export type AppOpenAdType = FullscreenAdBase & {
  /**
   * Controls whether the ad should be automatically displayed when the user returns to the app.
   * Note: the ad must be ready at the moment the app returns to foreground.
   */
  setAutoshowEnabled(enabled: boolean): void;
};

/** Interstitial ads specific options. */
export type InterstitialAdType = FullscreenAdBase & {
  /**
   * Controls whether the ad should be automatically displayed when the user returns to the app.
   * Note: the ad must be ready at the moment the app returns to foreground.
   */
  setAutoshowEnabled(enabled: boolean): void;

  /**
   * The minimum interval between showing interstitial ads, in seconds.
   * Showing earlier will trigger onAdFailedToShow with AdErrorCode.NOT_PASSED_INTERVAL.
   * The timer is shared across instances; values may differ per instance.
   */
  setMinInterval(seconds: number): void;

  /**
   * Restarts the interval countdown until the next interstitial ad display.
   * Useful to delay an interstitial after showing Rewarded/AppOpen.
   */
  restartInterval(): void;
};

/** Rewarded ads specific options. */
export type RewardedAdType = FullscreenAdBase & {
  /**
   * Called when the user has earned the reward.
   * Note: This differs from the dismissed callback — a user might dismiss without earning a reward.
   */
  addAdUserEarnRewardEventListener(l: () => void): Unsubscribe;

  /**
   * Sets custom data to be included in server-side verification callbacks.
   * Maximum 8192 characters allowed for the custom data.
   *
   * The callbacks contain query parameters that describe the rewarded ad interaction,
   * including the `placement` and `CASMobileAds.setUserId` alongside any custom data provided here.
   *
   * This feature is currently in closed beta.
   */
  setServerSideVerificationData(data: string | null): void;
};
