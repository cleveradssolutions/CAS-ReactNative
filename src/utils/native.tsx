import { requireNativeComponent, UIManager, NativeModules } from 'react-native';
import { LINKING_ERROR } from './strings';
import type {
  StyleProp,
  ViewStyle,
  NativeSyntheticEvent,
  ViewProps,
} from 'react-native';
import { BannerAdSize } from './types';
import type { AdViewFailedEvent, AdViewPresentedEvent } from './types';

const ComponentName = 'BannerAdView';

type NativeBannerProps = ViewProps & {
  style: StyleProp<ViewStyle>;
  onAdViewLoaded: (
    e: NativeSyntheticEvent<{ width: number; height: number }>
  ) => void;
  onAdViewFailed: (e: NativeSyntheticEvent<AdViewFailedEvent>) => void;
  onAdViewClicked: () => void;
  isAdReady: (e: NativeSyntheticEvent<boolean>) => void;
  onAdViewPresented: (e: NativeSyntheticEvent<AdViewPresentedEvent>) => void;
  size: {
    size: BannerAdSize;
    maxWidthDpi?: number;
    isAdaptive?: boolean;
  };
  isAutoloadEnabled?: boolean;
  refreshInterval?: number;
};

export const BannerAdView =
  UIManager.getViewManagerConfig(ComponentName) != null
    ? requireNativeComponent<NativeBannerProps>(ComponentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };

export const BannerAdViewCommands =
  UIManager.getViewManagerConfig('BannerAdView').Commands;

export const CasModule = NativeModules.CasModule;
export const MediationManagerModule = NativeModules.MediationManagerModule;
