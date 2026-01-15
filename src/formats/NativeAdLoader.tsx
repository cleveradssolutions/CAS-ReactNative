import CASMobileAdsNative from '../modules/NativeCASMobileAdsModule';
import type { AdChoicesPlacement, NativeAdLoaderType, NativeAdContent } from '../types/NativeAds';
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
  setStartVideoMuted: CASMobileAdsNative.setNativeMutedEnabled,
  setAdChoicesPlacement: (placement: AdChoicesPlacement) => {
    CASMobileAdsNative.setNativeAdChoicesPlacement(Number(placement));
  },

  addAdLoadedEventListener: l =>
    addAdEventListener(
      NativeAdEvent.LOADED,
      (content: { instanceId: number; content: (string | null)[] }) => {
        const instanceId = content.instanceId;
        const nativeAd: NativeAdContent = {
          instanceId: instanceId,
          content: content.content,
          destroy: () => CASMobileAdsNative.destroyNative(instanceId),
          isExpired: () => CASMobileAdsNative.isNativeExpired(instanceId),
        };
        l(nativeAd);
      },
    ),
  addAdFailedToLoadEventListener: l => addAdEventListener(NativeAdEvent.FAILED_TO_LOAD, l),
  addAdClickedEventListener: l => addAdEventListener(NativeAdEvent.CLICKED, l),
  addAdImpressionEventListener: l => addAdEventListener(NativeAdEvent.IMPRESSION, l),
  addAdFailedToShowEventListener: l => addAdEventListener(NativeAdEvent.FAILED_TO_SHOW, l),
};
