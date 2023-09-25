import { CasModule } from '../utils/native';
import type {
  BuildManagerParams,
  BuildManagerResult,
  TargetingOptions,
  AudienceNetworkDataProcessingOptions,
  CASSettings,
  onDismissConsentFlowListener,
  ConsentFlowParams,
} from '../utils/types';
import { MediationManager } from './mediation-manager.module';
import { NativeEventEmitter, Platform } from 'react-native';

class Cas {
  private eventEmitter = new NativeEventEmitter(CasModule);

  buildManager = async (
    params: BuildManagerParams,
    cb: onDismissConsentFlowListener
  ): Promise<BuildManagerResult> => {
    let unsub = this.eventEmitter.addListener('consentFlowDismissed', (e) => {
      cb(e);
      unsub.remove();
    });

    const result = await CasModule.buildManager(params);

    return {
      result,
      manager: new MediationManager(),
    };
  };

  showConsentFlow = async (
    params: Omit<ConsentFlowParams, 'enabled'>,
    cb: onDismissConsentFlowListener
  ) => CasModule.showConsentFlow(params, cb);

  getSDKVersion = async (): Promise<string> => CasModule.getSDKVersion();

  getTargetingOptions = async (): Promise<TargetingOptions> =>
    CasModule.getTargetingOptions();

  setTargetingOptions = async (options: Partial<TargetingOptions>) =>
    CasModule.setTargetingOptions(options);

  getSettings = async (): Promise<CASSettings> => CasModule.getSettings();

  setSettings = async (settings: Partial<CASSettings>) =>
    CasModule.setSettings(settings);

  restartInterstitialInterval = async () =>
    CasModule.restartInterstitialInterval();

  debugValidateIntegration = async () => CasModule.debugValidateIntegration();

  // Facebook specific
  setAudienceNetworkDataProcessingOptions = async (
    params: AudienceNetworkDataProcessingOptions
  ) => CasModule.setAudienceNetworkDataProcessingOptions(params);

  setAdvertiserTrackingEnabled = async (enable: boolean) =>
    Platform.OS === 'ios' && CasModule.setAdvertiserTrackingEnabled(enable);

  // Google specific
  setGoogleAdsConsentForCookies = async (enabled: boolean) =>
    Platform.OS === 'android' &&
    CasModule.setGoogleAdsConsentForCookies(enabled);
}

export const CAS = new Cas();
