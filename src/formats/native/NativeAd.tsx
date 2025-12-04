import CASMobileAdsNative from '../../modules/NativeCASMobileAdsModule';
import type { NativeAdType } from './NativeAdType';
import { addAdEventListener } from '../../EventEmitter';

enum NativeAdEvent {
  LOADED = 'onNativeAdLoaded',
  FAILED_TO_LOAD = 'onNativeAdFailedToLoad',
  CLICKED = 'onNativeAdClicked',
  IMPRESSION = 'onNativeAdImpression',
}

export const NativeAd: NativeAdType = {
  loadAd: CASMobileAdsNative.loadNativeAd,
  setNativeMutedEnabled: CASMobileAdsNative.setNativeMutedEnabled,
  setNativeAdChoisesPlacement: CASMobileAdsNative.setNativeAdChoisesPlacement,
  destroyAd: CASMobileAdsNative.destroyNative,

  addAdLoadedEventListener: l => addAdEventListener(NativeAdEvent.LOADED, l),
  addAdFailedToLoadEventListener: l => addAdEventListener(NativeAdEvent.FAILED_TO_LOAD, l),
  addAdClickedEventListener: l => addAdEventListener(NativeAdEvent.CLICKED, l),
  addAdImpressionEventListener: l => addAdEventListener(NativeAdEvent.IMPRESSION, l),
};