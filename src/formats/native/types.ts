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
export type NativeTemplateFontStyle =
  | 'normal'
  | 'bold'
  | 'italic'
  | 'monospace';

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
  backgroundColor?: string;

  /**
   * Accent color applied to elements such as the call-to-action button.
   */
  primaryColor?: string;

  /**
   * Color of the primary text elements, such as the main body text.
   */
  primaryTextColor?: string;

  /**
   * Text color for the headline (title) of the ad.
   */
  headlineTextColor?: string;

  /**
   * Font style used for the headline text.
   */
  headlineFontStyle?: NativeTemplateFontStyle;

  /**
   * Text color for secondary descriptive elements, such as the ad body or advertiser name.
   */
  secondaryTextColor?: string;

  /**
   * Font style applied to secondary text elements.
   */
  secondaryFontStyle?: NativeTemplateFontStyle;
}

/**
 * Represents all available events emitted by a Native Ad during its lifecycle.
 */
export enum NativeAdEventType {
  /**
   * Indicates that a native ad has been successfully loaded.
   */
  LOADED = 'onNativeAdLoaded',

  /**
   * Indicates that the native ad failed to load due to an error.
   */
  FAILED_TO_LOAD = 'onNativeAdFailedToLoad',

  /**
   * Triggered when the user interacts with (clicks) the native ad.
   */
  CLICKED = 'onNativeAdClicked',

  /**
   * Triggered when the native ad becomes visible to the user,
   * counting as an impression.
   */
  IMPRESSION = 'onNativeAdImpression',
}
