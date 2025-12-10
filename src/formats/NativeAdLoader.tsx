import CASMobileAdsNative from '../modules/NativeCASMobileAdsModule';
import type { AdChoicesPlacement, NativeAdLoaderType, NativeAdType } from '../types/NativeAdType';
import { addAdEventListener } from '../EventEmitter';

const enum NativeAdEvent {
  LOADED = 'onNativeAdLoaded',
  FAILED_TO_LOAD = 'onNativeAdFailedToLoad',
  CLICKED = 'onNativeAdClicked',
  IMPRESSION = 'onNativeAdImpression',
  FAILED_TO_SHOW = 'onNativeAdFailedToShow',
}

export const NativeAdLoader: NativeAdLoaderType = {
  loadAds: CASMobileAdsNative.loadNativeAd,
  setNativeMutedEnabled: CASMobileAdsNative.setNativeMutedEnabled,
  setNativeAdChoicesPlacement: (placement: AdChoicesPlacement) => {
    CASMobileAdsNative.setNativeAdChoicesPlacement(Number(placement));
  },

  addAdLoadedEventListener: l =>
    addAdEventListener(NativeAdEvent.LOADED, (instanceId: number) => {
      let nativeAd: NativeAdType = {
        instanceId: instanceId,
        destroyAd: () => CASMobileAdsNative.destroyNative(instanceId),
      };
      l(nativeAd);
    }),
  addAdFailedToLoadEventListener: l => addAdEventListener(NativeAdEvent.FAILED_TO_LOAD, l),
  addAdClickedEventListener: l => addAdEventListener(NativeAdEvent.CLICKED, l),
  addAdImpressionEventListener: l => addAdEventListener(NativeAdEvent.IMPRESSION, l),
  addAdFailedToShowEventListener: l => addAdEventListener(NativeAdEvent.FAILED_TO_SHOW, l),
};
