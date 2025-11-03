import { NativeEventEmitter } from 'react-native';
import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';
import CASNativeAdModule from './CASNativeAdModule';
import type { AdChoicesPlacement, NativeTemplateStyle, NativeAdEventType } from './types';

export class NativeAd {
  readonly adId: number;
  readonly casId: string | null;
  readonly factoryId?: string | null;
  private nativeEventSubscription;
  private eventEmitter: EventEmitter;

  private constructor(adId: number, casId: string | null, factoryId?: string) {
    this.adId = adId;
    this.casId = casId;
    this.factoryId = factoryId;

    const nativeEmitter = new NativeEventEmitter(CASNativeAdModule);
    this.nativeEventSubscription = nativeEmitter.addListener(
      'RNCASNativeAdEvent',
      this.onNativeAdEvent.bind(this)
    );

    this.eventEmitter = new EventEmitter();
  }

  private onNativeAdEvent({ adId, type, error }: any) {
    if (this.adId !== adId) return;
    this.eventEmitter.emit(type, error);
  }

  addAdEventListener(
    type: NativeAdEventType,
    listener: (payload?: any) => void
  ) {
    return this.eventEmitter.addListener(type, listener);
  }

  removeAllAdEventListeners() {
    this.eventEmitter.removeAllListeners();
  }

  destroy() {
    CASNativeAdModule.destroy(this.adId);
    this.nativeEventSubscription.remove();
    this.removeAllAdEventListeners();
  }

  static async createForAdRequest(
    casId: string | null,
    options?: {
      factoryId?: string;
      adChoicesPlacement?: AdChoicesPlacement;
      startVideoMuted?: boolean;
      templateStyle?: NativeTemplateStyle;
      customOptions?: Record<string, any>;
    }
  ): Promise<NativeAd> {
    const response = await CASNativeAdModule.loadAd({
      casId,
      factoryId: options?.factoryId ?? null,
      adChoicesPlacement: options?.adChoicesPlacement ?? 1,
      startVideoMuted: options?.startVideoMuted ?? true,
      templateStyle: options?.templateStyle ?? null,
      customOptions: options?.customOptions ?? null,
    });

    return new NativeAd(response.adId, casId, options?.factoryId);
  }
}
