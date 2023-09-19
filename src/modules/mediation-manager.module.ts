import { MediationManagerModule } from '../utils/native';
import type {
  LastPageAdContent,
  MediationManagerEventListener,
  ShowAdCallbacks,
} from '../utils/types';
import { NativeEventEmitter } from 'react-native';
import { MediationManagerEvent } from '../utils/types';
import type { AdImpression } from '../utils/types';

type GenericEvent = {
  callbackId: string;
  data?: AdImpression | string;
};

export class MediationManager {
  private eventEmitter = new NativeEventEmitter(MediationManagerModule);
  private showAdListeners: Record<string, ShowAdCallbacks> = {};

  constructor() {
    this.eventEmitter.addListener('onShown', (e: GenericEvent) => {
      this.showAdListeners[e.callbackId]?.onShown?.(e.data as AdImpression);
    });

    this.eventEmitter.addListener('onShowFailed', (e: GenericEvent) => {
      this.showAdListeners[e.callbackId]?.onShowFailed?.(e.data as string);
      delete this.showAdListeners[e.callbackId];
    });

    this.eventEmitter.addListener('onClicked', (e: GenericEvent) => {
      this.showAdListeners[e.callbackId]?.onClicked?.();
    });

    this.eventEmitter.addListener('onComplete', (e: GenericEvent) => {
      this.showAdListeners[e.callbackId]?.onComplete?.();
      delete this.showAdListeners[e.callbackId];
    });

    this.eventEmitter.addListener('onClosed', (e: GenericEvent) => {
      this.showAdListeners[e.callbackId]?.onClosed?.();
      delete this.showAdListeners[e.callbackId];
    });
  }

  addListener = (
    event: MediationManagerEvent,
    listener: MediationManagerEventListener
  ) => {
    return this.eventEmitter.addListener(event, listener);
  };

  private createShowAdCallback = (props: ShowAdCallbacks) => {
    const id = Math.random().toString(36).slice(2, 7);
    this.showAdListeners[id] = props;
    return id;
  };

  setLastPageAdContent = async (params: LastPageAdContent) => {
    return MediationManagerModule.setLastPageAdContent(params);
  };

  loadInterstitial = async () => MediationManagerModule.loadInterstitial();

  isInterstitialReady = async (): Promise<boolean> =>
    MediationManagerModule.isInterstitialReady();

  showInterstitial = async (props: ShowAdCallbacks) => {
    return MediationManagerModule.showInterstitial(
      this.createShowAdCallback(props)
    );
  };

  loadRewardedAd = async () => MediationManagerModule.loadRewardedAd();

  isRewardedAdReady = async (): Promise<boolean> =>
    MediationManagerModule.isRewardedAdReady();

  showRewardedAd = async (props: ShowAdCallbacks) => {
    return MediationManagerModule.showRewardedAd(
      this.createShowAdCallback(props)
    );
  };

  enableAppReturnAds = async (props: ShowAdCallbacks) => {
    return MediationManagerModule.enableAppReturnAds(
      this.createShowAdCallback(props)
    );
  };

  disableAppReturnAds = async () =>
    MediationManagerModule.disableAppReturnAds();

  skipNextAppReturnAds = async () =>
    MediationManagerModule.skipNextAppReturnAds();

  loadAppOpenAd = async (isLandscape: boolean) =>
    MediationManagerModule.loadAppOpenAd(isLandscape);

  isAppOpenAdAvailable = async (): Promise<boolean> =>
    MediationManagerModule.isAppOpenAdAvailable();

  showAppOpenAd = async (props: ShowAdCallbacks) => {
    return MediationManagerModule.showAppOpenAd(
      this.createShowAdCallback(props)
    );
  };
}
