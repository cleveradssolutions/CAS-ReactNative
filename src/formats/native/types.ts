export enum AdChoicesPlacement {
  topLeftCorner = 0,
  topRightCorner = 1,
  bottomRightCorner = 2,
  bottomLeftCorner = 3,
}

export type NativeTemplateFontStyle = 'normal' | 'bold' | 'italic' | 'monospace';

export interface NativeTemplateStyle {
  backgroundColor?: string;
  primaryColor?: string;
  primaryTextColor?: string;
  headlineTextColor?: string;
  headlineFontStyle?: NativeTemplateFontStyle;
  secondaryTextColor?: string;
  secondaryFontStyle?: NativeTemplateFontStyle;
}

export enum NativeAdEventType {
  LOADED = 'onAdLoaded',
  FAILED_TO_LOAD = 'onAdFailedToLoad',
  CLICKED = 'onAdClicked',
  IMPRESSION = 'onAdImpression',
}