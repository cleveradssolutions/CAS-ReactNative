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

import { ColorValue, StyleProp, TextProps, ViewStyle } from 'react-native';
import type { AdError, AdContentInfo } from './AdContent';

export type NativeAdLoaderType = {
  /**
   * Starts loading a single native ad.
   *
   * This method initiates the loading of a single native ad.
   *
   * Ensure that the `addAdLoadedEventListener` is set before calling this method,
   * as it is required to receive the loaded native ad content.
   */
  loadAd(): void;

  /**
   * Starts loading multiple native ads with a specified maximum number.
   *
   * This method allows you to request multiple native ads in one load operation. It is not guaranteed that the exact
   * number of ads requested will be returned.
   *
   * The `addAdLoadedEventListener` will be invoked once for each successfully loaded ad, up to the requested maximum.
   * If the loading operation fails, the `addAdFailedToLoadEventListener` will be triggered with the error details.
   */
  loadAds(maxNumberOfAds: number): void;

  /**
   * Sets the initial mute state for video ads.
   *
   * By default, video ads will start with the sound muted. You can modify this setting to ensure that the video
   * starts with sound enabled or muted, depending on your app's requirements.
   */
  setStartVideoMuted(muted: boolean): void;

  /**
   * Configures the placement of the AdChoices icon within the ad content.
   *
   * The `AdChoicesPlacement` allows you to define the location of the AdChoices icon, ensuring compliance
   * with privacy and advertising regulations. Customize this property to align with your app's design and user experience.
   */
  setAdChoicesPlacement(placement: AdChoicesPlacement): void;

  /**
   * Fired when the native ad content has been successfully loaded.
   *
   * Always call the `NativeAdContent.destroy()` on all loaded native ads,
   * even if they are not used or referenced. This ensures proper resource cleanup and prevents memory leaks.
   *
   * @returns a disposer function to remove the listener.
   */
  addAdLoadedEventListener(l: (ad: NativeAdContent) => void): () => void;

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
 * Represents the content of a native ad.
 *
 * You must pass an instance of this object to `NativeAdView`
 * to populate and display the ad content within the view.
 */
export type NativeAdContent = {
  /**
   * Temporary unique identifier of the loaded native ad content.
   */
  instanceId: number;

  /**
   * Array of values for text assets, if available.
   */
  content: (string | null)[];

  /**
   * Cleans up and releases resources associated with the native ad content.
   *
   * This method should be called when the native ad is no longer needed, ensuring proper resource management
   * and preventing memory leaks.
   */
  destroy: () => void;

  /**
   * Indicates whether the native ad has expired.
   *
   * Returns `true` if the ad has expired or is no longer valid (e.g., past its display window).
   * An expired ad may not be shown and interactions with it may be restricted or disabled.
   */
  isExpired: () => Promise<boolean>;
};

/**
 * Defines the placement of the AdChoices icon inside the native ad view.
 * The AdChoices icon helps users understand why they are seeing the ad.
 */
export enum AdChoicesPlacement {
  /**
   * Places the AdChoices icon in the top-left corner of the native ad view.
   */
  TOP_LEFT = 0,

  /**
   * Places the AdChoices icon in the top-right corner of the native ad view.
   */
  TOP_RIGHT = 1,

  /**
   * Places the AdChoices icon in the bottom-right corner of the native ad view.
   */
  BOTTOM_RIGHT = 2,

  /**
   * Places the AdChoices icon in the bottom-left corner of the native ad view.
   */
  BOTTOM_LEFT = 3,
}

/**
 * Props for the NativeAdView component.
 *
 * Defines size constraints and optional template styling
 * to control how the native ad is displayed on the screen.
 */
export interface NativeAdViewProps {
  /**
   * The native ad instance to be displayed within the view.
   */
  ad: NativeAdContent;

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

  /**
   * Optional React Native style for wrapping layout.
   */
  style?: StyleProp<ViewStyle> | undefined;
}

/**
 * Props for native ad asset components.
 */
export type NativeAdAssetProps = {
  style?: StyleProp<ViewStyle> | undefined;
};

export type NativeAdTextAssetProps = Omit<TextProps, 'children'>;

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
   * Accent color applied to elements such as the call-to-action button.
   */
  primaryColor?: ColorValue;

  /**
   * Color of the primary text elements, such as the main body text.
   */
  primaryTextColor?: ColorValue;

  /**
   * Text color for the headline (title) of the ad.
   */
  headlineTextColor?: ColorValue;

  /**
   * Font style used for the headline text.
   */
  headlineFontStyle?: NativeTemplateFontStyle;

  /**
   * Text color for secondary descriptive elements, such as the ad body or advertiser name.
   */
  secondaryTextColor?: ColorValue;

  /**
   * Font style applied to secondary text elements.
   */
  secondaryFontStyle?: NativeTemplateFontStyle;
}

export const enum NativeAdAssetType {
  HEADLINE = 0,
  BODY = 1,
  CALL_TO_ACTION = 2,
  ADVERTISER = 3,
  STORE = 4,
  PRICE = 5,
  REVIEW_COUNT = 6,
  STAR_RATING = 7,
  AD_LABEL = 8,
  ICON = 9,
  MEDIA = 10,
  AD_CHOICES = 11,
}
