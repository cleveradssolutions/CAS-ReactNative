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

/** Audience category used for regulatory handling and content filtering. */
export enum Audience {
  /**
   * If your app's target age groups include both children and older audiences, any ads that may be shown to children must comply with Google Play's Families Ads Program.
   *
   * A neutral age screen must be implemented so that any ads not suitable for children are only shown to older audiences.
   * A neutral age screen is a mechanism to verify a user's age in a way that doesn't encourage them to falsify their age
   * and gain access to areas of your app that aren't designed for children, for example, an age gate.
   */
  UNDEFINED = 0,
  /**
   * Compliance with all applicable legal regulations and industry standards relating to advertising to children.
   */
  CHILDREN = 1,
  /**
   * Audiences over the age of 13 NOT subject to the restrictions of child protection laws.
   */
  NOT_CHILDREN = 2,
}

/** User’s geography used to determine which privacy rules apply. */
export enum PrivacyGeography {
  /** Geography is unknown. */
  UNKNOWN = 0,
  /** Geography appears as in European Economic Area. */
  EUROPEAN_ECONOMIC_AREA = 1,
  /** Geography appears as in a regulated US State. */
  REGULATED_US_STATE = 3,
  /** Geography appears as in a region with no regulation in force. */
  UNREGULATED = 4,
}

/** Initialization options for the SDK bootstrap. */
export type InitializationParams = {
  /**
   * Indicates the target {@link Audience} of the app for regulatory and content purposes.
   * This may affect how the SDK handles data collection, personalization,
   * and content rendering, especially for audiences such as children.
   */
  targetAudience?: Audience;

  /**
   * Shows the consent form only if it is required and the user has not responded previously.
   * If the consent status is required, the SDK loads a form and immediately presents it.
   */
  showConsentFormIfRequired?: boolean;

  /**
   * Enable test ads mode that will always return test ads for all devices.
   * **Attention** Don't forget to set it to False after the tests are completed.
   */
  forceTestAds?: boolean;

  /**
   * Add a test device ID corresponding to test devices which will always request test ads.
   * List of test devices should be defined before first MediationManager initialized.
   *
   * 1. Run an app with the CAS SDK `initialize()` call.
   * 2. Check the console or logcat output for a message that looks like this:
   *    "To get test ads on this device, set ... "
   * 3. Copy your alphanumeric test device ID to your clipboard.
   * 4. Add the test device ID to the `testDeviceIds` list.
   */
  testDeviceIds?: string[];

  /** Sets the debug geography for testing purposes. (Only effective in test sessions.) */
  debugGeography?: PrivacyGeography;

  /** Additional mediation settings. */
  mediationExtras?: { [key: string]: string };
};

/** Result of the SDK initialization attempt. */
export type InitializationStatus = {
  /**
   * Initialization error or `undefined` if success.
   * Check value against known error string constants if needed by platform.
   */
  error?: string;

  /** User Country code ISO-2 or `undefined` if not allowed. */
  countryCode?: string;

  /** Indicates the privacy options button is required. */
  isConsentRequired: boolean;

  /** Consent flow status code. See {@link ConsentFlowStatus}. */
  consentFlowStatus: ConsentFlowStatus;
};

export enum ConsentFlowStatus {
  /** There was no attempt to show the consent flow. */
  UNKNOWN = 0,
  /** User consent obtained. Personalized vs non-personalized undefined. */
  OBTAINED = 3,
  /** User consent not required. */
  NOT_REQUIRED = 4,
  /** User consent unavailable. */
  UNAVAILABLE = 5,
  /** There was an internal error. */
  INTERNAL_ERROR = 10,
  /** There was an error loading data from the network. */
  NETWORK_ERROR = 11,
  /** There was an error with the UI context passed in. */
  INVALID_CONTEXT = 12,
  /** There was an error with another form still being displayed. */
  STILL_PRESENTING = 13,
}
