import CASMobileAdsNative from '../modules/NativeCASMobileAdsModule';
import type { AdChoicesPlacement, NativeAdLoaderType, NativeAdType } from '../types/NativeAdType';
import { addAdEventListener } from '../EventEmitter';

const enum NativeAdEvent {
  LOADED = 'onNativeAdLoaded',
  FAILED_TO_LOAD = 'onNativeAdFailedToLoad',
  CLICKED = 'onNativeAdClicked',
  IMPRESSION = 'onNativeAdImpression',
}

export const NativeAdLoader: NativeAdLoaderType = {
  loadAd: CASMobileAdsNative.loadNativeAd,
  setNativeMutedEnabled: CASMobileAdsNative.setNativeMutedEnabled,
  setNativeAdChoisesPlacement: (placement: AdChoicesPlacement) => {
    CASMobileAdsNative.setNativeAdChoisesPlacement(Number(placement));
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
};
