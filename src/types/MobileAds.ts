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

import type {
  InitializationStatus,
  InitializationParams,
  ConsentFlowStatus,
} from './Initialization.ts';

export interface MobileAds {
  /**
   * Initializes the CAS Mobile Ads SDK.
   *
   * Call this method as early as possible after the app launches to reduce
   * latency on the session's first ad load.
   *
   * If this method is not called, the first ad load automatically
   * initializes the CAS Mobile Ads SDK with CAS Id defined in ad load arguments.
   *
   * **Note:** This {@link Promise} may take an unexpectedly long time to complete,
   * as it will only resolve once the SDK has either successfully initialized
   * or failed with a error.
   *
   * If an error occurs, the SDK will attempt automatic reinitialization internally.
   * However, this {@link Promise} will not be updated with subsequent {@link InitializationStatus}.
   * For the most up-to-date {@link InitializationStatus}, call this method again at a later time.
   *
   * @param casId
   * The unique identifier for the CAS content registered for your app on each platform.
   * You can use the value `demo` to force test ads mode on all devices if you haven't registered a casId yet.
   */
  initialize(casId: string, options: InitializationParams): Promise<InitializationStatus>;

  /** Is SDK initialized. */
  isInitialized(): Promise<boolean>;

  /**
   * Call `CASMobileAds.showConsentFlow()` to show the built-in consent form manually.
   * If the consent is required, the SDK loads the form and immediately presents it.
   * The `Promise<ConsentFlowStatus>` completes after the form is dismissed.
   * If consent is not required, the `Promise` resolves instantly.
   */
  showConsentFlow(): Promise<ConsentFlowStatus>;

  /** Returns the underlying native SDK version, e.g. "4.3.0". */
  getSDKVersion(): Promise<string>;

  /** Enables or disables debug logging to the console (native logcat/console). */
  setDebugLoggingEnabled(enabled: boolean): void;

  /**
   * Sets whether the ad source is muted.
   *
   * Affects initial mute state for fullscreen ads.
   * Use this method only if your application has its own volume controls
   * (e.g., custom music or sound effect muting).
   *
   * Not muted by default.
   */
  setAdSoundsMuted(muted: boolean): void;

  /**
   * Sets the user’s age.
   *
   * Limitation: 1–99, and 0 is 'unknown'.
   * Note: Only pass data you are legally allowed to share.
   */
  setUserAge(age: number): void;

  /**
   * Set targeting to user’s gender.
   */
  setUserGender(gender: Gender): void;

  /**
   * Sets a list of keywords, interests, or intents related to your application.
   *
   * Words or phrases describing the current activity of the user for targeting purposes.
   */
  setAppKeywords(keywords: string[]): void;

  /**
   * Sets the content URL for a website whose content matches the app's primary content.
   * This website content is used for targeting and brand safety purposes.
   *
   * Limitation: max URL length 512.
   * Pass `undefined` to clear the value.
   */
  setAppContentUrl(contentUrl?: string): void;

  /**
   * Collect from the device the latitude and longitude coordinates truncated to the
   * hundredths decimal place.
   *
   * Collect only if your application already has the relevant end-user permissions.
   * Does not collect if the target audience is children.
   * Disabled by default.
   */
  setLocationCollectionEnabled(enabled: boolean): void;

  /**
   * Defines the time interval, in seconds, starting from the moment of the initial app installation,
   * during which users can use the application without ads being displayed while still retaining
   * access to the Rewarded Ads format.
   * Within this interval, users enjoy privileged access to the application's features without intrusive advertisements.
   *
   * Default: 0 seconds.
   */
  setTrialAdFreeInterval(interval: number): void;
}

/** Optional targeting value. */
export enum Gender {
  /** Unknown gender. */
  UNKNOWN = 0,
  /** Male. */
  MALE = 1,
  /** Female. */
  FEMALE = 2,
}
