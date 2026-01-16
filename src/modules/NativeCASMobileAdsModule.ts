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

import { TurboModuleRegistry } from 'react-native';
import type { TurboModule } from 'react-native';
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import type { InitializationStatus } from '../types/Initialization';

export interface Spec extends TurboModule {
  // SDK
  initialize(
    casId: string,
    options: {
      reactNativeVersion: string;
      targetAudience?: Int32;
      showConsentFormIfRequired: boolean;
      forceTestAds: boolean;
      testDeviceIds?: string[];
      debugGeography?: Int32;
      mediationExtras?: { [key: string]: string };
    },
  ): Promise<InitializationStatus>;
  isInitialized(): Promise<boolean>;
  getSDKVersion(): Promise<string>;
  showConsentFlow(): Promise<number>;

  // App/Targeting
  setUserAge(age: Int32): void;
  setUserGender(gender: Int32): void;
  setAppContentUrl(contentUrl?: string): void;
  setAppKeywords(keywords: string[]): void;
  setDebugLoggingEnabled(enabled: boolean): void;
  setAdSoundsMuted(muted: boolean): void;
  setLocationCollectionEnabled(enabled: boolean): void;
  setTrialAdFreeInterval(interval: Int32): void;

  // Interstitial
  isInterstitialAdLoaded(): Promise<boolean>;
  loadInterstitialAd(): void;
  showInterstitialAd(): void;
  setInterstitialAutoloadEnabled(enabled: boolean): void;
  setInterstitialAutoshowEnabled(enabled: boolean): void;
  setInterstitialMinInterval(seconds: Int32): void;
  restartInterstitialInterval(): void;
  destroyInterstitial(): void;

  // Rewarded
  isRewardedAdLoaded(): Promise<boolean>;
  loadRewardedAd(): void;
  showRewardedAd(): void;
  setRewardedAutoloadEnabled(enabled: boolean): void;
  destroyRewarded(): void;

  // App Open
  isAppOpenAdLoaded(): Promise<boolean>;
  loadAppOpenAd(): void;
  showAppOpenAd(): void;
  setAppOpenAutoloadEnabled(enabled: boolean): void;
  setAppOpenAutoshowEnabled(enabled: boolean): void;
  destroyAppOpen(): void;

  // Native
  loadNativeAd(maxNumberOfAds: Int32): void;
  setNativeMutedEnabled(enabled: boolean): void;
  setNativeAdChoicesPlacement(adChoicesPlacement: Int32): void;
  destroyNative(instanceId: Int32): void;
  isNativeExpired(instanceId: Int32): Promise<boolean>;

  // EventEmitter bridge
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('CASMobileAds');
