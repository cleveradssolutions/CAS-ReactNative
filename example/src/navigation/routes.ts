export type RootStackParamList = {
  Setup: undefined;
  Menu: undefined;

  Interstitial: undefined;
  Rewarded: undefined;
  AppOpen: undefined;

  Native: undefined;
  NativeSizeExample: undefined;

  Banner: undefined;
  MREC: undefined;
  Adaptive: undefined;
  Scrolled: undefined;
};

export const ROUTE_TITLES: Record<keyof RootStackParamList, string> = {
  Setup: 'Setup',
  Menu: 'Menu',

  Interstitial: 'Interstitial Ad',
  Rewarded: 'Rewarded Ad',
  AppOpen: 'App Open Ad',

  Native: 'Native Ad',
  NativeSizeExample: 'Native Ad (Template Size)',

  Banner: 'Banner Ad',
  MREC: 'MREC Ad',
  Adaptive: 'Adaptive Banner Ad',
  Scrolled: 'Scrolled Ad View',
};
