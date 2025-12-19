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

import { ColorValue, ViewStyle } from 'react-native';
import type { AdError, AdContentInfo } from './AdContent';

export type NativeAdLoaderType = {
  /**
   * Manually retries loading multiple native ads with a specified maximum number.
   * This method allows you to request multiple native ads in one load operation. It is not guaranteed that the exact
   * number of ads requested will be returned. 
   * 
   * The ad view will try to fetch a new ad and will trigger:
   * - `addAdLoadedEventListener` on success
   * - `addAdFailedToLoadEventListener` on failure
   */
  loadAds: (maxNumberOfAds: number) => void;

  /**
   * Enables or disables native ad muting (UI and audio behavior).
   *
   * @param enabled - If true, the ad will start muted (if supported).
   */
  setNativeMutedEnabled(enabled: boolean): void;

  /**
   * Sets the placement of the AdChoices icon.
   *
   * Implementation may vary depending on the underlying SDK.
   */
  setNativeAdChoicesPlacement(adChoicesPlacement: AdChoicesPlacement): void;

  /**
   * Fired when an ad successfully loads.
   *
   * @returns a disposer function to remove the listener.
   */
  addAdLoadedEventListener(l: (ad: NativeAdType) => void): () => void;

  /**
   * Fired when loading a native ad fails.
   *
   * @param error - detailed error object.
   * @returns a disposer function to remove the listener.
   */
  addAdFailedToLoadEventListener(l: (error: AdError) => void): () => void;

  /**
   * Fired when the user clicks the native ad.
   *
   * @returns a disposer function to remove the listener.
   */
  addAdClickedEventListener(l: () => void): () => void;

  /**
   * Fired when an impression occurs for this native ad.
   *
   * The callback receives a full `AdContentInfo` data object from the SDK.
   *
   * @returns a disposer function to remove the listener.
   */
  addAdImpressionEventListener(l: (info: AdContentInfo) => void): () => void;

  /**
   * Fired when showing a native ad fails.
   *
   * @param error - detailed error object.
   * @returns a disposer function to remove the listener.
   */
  addAdFailedToShowEventListener(l: (error: AdError) => void): () => void;  
};

/**
 * Represents a loaded and managed Native Ad instance.
 *
 * Provides lifecycle management (load, destroy), event handling,
 * and additional configuration parameters for muting, AdChoices, etc.
 */
export type NativeAdType = {
  instanceId: number;
  /**
   * Frees all underlying native ad resources.
   * Must be called when the ad is no longer displayed.
   */
  destroyAd: () => void;
};

/**
 * Defines the placement of the AdChoices icon inside the native ad view.
 * The AdChoices icon helps users understand why they are seeing the ad.
 */
export enum AdChoicesPlacement {
  /**
   * Places the AdChoices icon in the top-left corner of the native ad view.
   */
  topLeftCorner = 0,

  /**
   * Places the AdChoices icon in the top-right corner of the native ad view.
   */
  topRightCorner = 1,

  /**
   * Places the AdChoices icon in the bottom-right corner of the native ad view.
   */
  bottomRightCorner = 2,

  /**
   * Places the AdChoices icon in the bottom-left corner of the native ad view.
   */
  bottomLeftCorner = 3,
}

/**
 * Represents the allowed font styles for template text elements.
 */
export type NativeTemplateFontStyle = 'normal' | 'bold' | 'italic' | 'monospace';

/**
 * Defines customizable appearance options for native ad templates.
 * You can use these values to match the ad appearance to your application's theme.
 *
 * Colors are expected in hex string format (e.g., `#RRGGBB` or `#RRGGBBAA`).
 */
export interface NativeTemplateStyle {
  /**
   * Background color of the entire native ad container.
   */
  backgroundColor?: ColorValue;

  /**
   * Font style used for the headline text.
   */
  headlineFontStyle?: NativeTemplateFontStyle;

  /**
   * Font style applied to secondary text elements.
   */
  secondaryFontStyle?: NativeTemplateFontStyle;
}

/**
 * Props for the NativeAdView component.
 *
 * Defines size constraints and optional template styling
 * to control how the native ad is displayed on the screen.
 */
export interface NativeAdViewProps {
  ad: NativeAdType;
  /**
   * Desired width of the native ad view.
   * If not provided, the view will attempt to size itself based on template or parent layout.
   */
  width?: number;

  /**
   * Desired height of the native ad view.
   * If not provided, height will match the internal template layout.
   */
  height?: number;

  /**
   * Template configuration passed to native platforms.
   *
   * Can define:
   * - background colors
   * - text styles
   * - CTA button style
   * - optional rounded corners
   * - predefined layout presets
   */
  templateStyle?: NativeTemplateStyle;

  // AssetViews
  children?: React.ReactNode;

  /**
   * Optional React Native style for wrapping layout.
   */
  style?: ViewStyle;
}

/**
 * Public methods available through the reference.
 * ```
 * <NativeAdView ref={...} />
 * ```
 */
export type NativeAdViewRef = {
};

export enum NativeAssetType {

  HEADLINE       = 101,
  MEDIA          = 102,
  CALL_TO_ACTION = 103,
  ICON           = 104,
  BODY           = 105,
  PRICE          = 106,
  ADVERTISER     = 107,
  STORE          = 108,
  STAR_RATING    = 109,
  REVIEW_COUNT   = 110,
  AD_LABEL       = 111,
  AD_CHOICES     = 112
};

export type NativeAssetRef = {
};

export interface NativeAssetProps {
  assetType: NativeAssetType;
  style?: ViewStyle;
  children?: never;
};