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

import type * as React from 'react';
import type { HostComponent, ViewProps } from 'react-native';
import type {
  Int32,
  Double,
  WithDefault,
  DirectEventHandler,
  Float,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';

type OnAdEvent = {};
type OnAdLoadedEvent = { width: Float; height: Float };
type OnAdFailedEvent = { code: Int32; message: string };
type OnAdImpressionEvent = {
  format: string;
  revenue: Double;
  revenuePrecision: string;
  sourceUnitId: string;
  sourceName: string;
  creativeId?: string;
  revenueTotal: Double;
  impressionDepth: Int32;
};

export interface NativeProps extends ViewProps {
  sizeConfig?: {
    sizeType: string;
    maxHeight: Float;
    maxWidth: Float;
  };
  autoReload?: WithDefault<boolean, true>;
  casId?: string;
  refreshInterval?: Int32;

  onAdViewLoaded?: DirectEventHandler<OnAdLoadedEvent>;
  onAdViewFailed?: DirectEventHandler<OnAdFailedEvent>;
  onAdViewClicked?: DirectEventHandler<OnAdEvent>;
  onAdViewImpression?: DirectEventHandler<OnAdImpressionEvent>;
}

type CASAdViewNativeComponentType = HostComponent<NativeProps>;

/**
 * Native commands callable from JS.
 */
interface NativeCommands {
  loadAd(ref: React.ElementRef<CASAdViewNativeComponentType>): void;
}

/**
 * JS interface to ad view commands.
 */
export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['loadAd'],
});

/**
 * Native view component for displaying a ad view.
 */
export default codegenNativeComponent<NativeProps>('CASAdView') as HostComponent<NativeProps>;