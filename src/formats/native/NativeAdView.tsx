import React from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';
import type { NativeTemplateStyle } from './types';

/**
 * Props for the NativeAdView component.
 *
 * Defines size constraints and optional template styling
 * to control how the native ad is displayed on the screen.
 */
export interface NativeAdViewProps {
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
  style?: ViewStyle;
}

/**
 * Native platform component (iOS/Android).
 * Rendered as a native ad container view.
 */
const RNCASNativeAdView = requireNativeComponent<NativeAdViewProps>('RNCASNativeAdView');

/**
 * React wrapper for the Native Ad View.
 *
 * Provides the necessary props and passes them
 * to the underlying native component instance.
 */
export const NativeAdView: React.FC<NativeAdViewProps> = ({
  width,
  height,
  templateStyle,
  style,
}) => {
  return (
    <RNCASNativeAdView
      width={width}
      height={height}
      templateStyle={templateStyle}
      style={style}
    />
  );
};
