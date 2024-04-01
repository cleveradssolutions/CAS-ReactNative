//
//  MediationManagerModule.swift
//  react-native-cas
//
//  Created by Lonely Astronaut on 20.09.23.
//

import Foundation
import CleverAdsSolutions

@objc(MediationManagerModule)
class MediationManagerModule: RCTEventEmitter, CASLoadDelegate {
    private var subId = ""
    private var changeId = ""
    private var appOpenAd: CASAppOpen? = nil
    private var callbacks: Dictionary<String, JSAdCallback> = [:]
    private static let APP_OPEN_AD_TYPE = 3
    
    override init() {
        super.init()
        subId = MediationManagerWrapper.shared.addLoadListener(self)
        changeId = MediationManagerWrapper.shared.addChangeListener { self.initCASAppOpen(manager: $0) }
    }
    
    override func supportedEvents() -> [String]! {
        ["onShown", "onAdRevenuePaid", "onShowFailed", "onClicked", "onComplete", "onClosed", "adLoaded", "adFailedToLoad"]
    }
    
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    func initCASAppOpen(manager: CASMediationManager) {
        appOpenAd = CASAppOpen.create(manager: manager)
    }
    
    @objc func setLastPageAdContent(_ content: NSDictionary) {
        MediationManagerWrapper.shared.manager?.lastPageAdContent = CASLastPageAdContent.fromDictionary(jsMap: content)
    }
    
    @objc func loadInterstitial() {
        DispatchQueue.main.async {
            MediationManagerWrapper.shared.manager?.loadInterstitial()
        }
    }
    
    @objc func isInterstitialReady(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        resolve(MediationManagerWrapper.shared.manager?.isInterstitialReady)
    }
    
    @objc func showInterstitial(_ callbackId: NSString) {
        DispatchQueue.main.async {
            MediationManagerWrapper.shared.manager?.presentInterstitial(
                fromRootViewController: UIApplication.shared.delegate!.window!!.rootViewController!,
                callback: self.createJSAdCallback("Interstitial", callbackId)
            )
        }
    }
    
    @objc func loadRewardedAd() {
        MediationManagerWrapper.shared.manager?.loadRewardedAd()
    }
    
    @objc func isRewardedAdReady(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        resolve(MediationManagerWrapper.shared.manager?.isRewardedAdReady)
    }
    
    @objc func showRewardedAd(_ callbackId: NSString) {
        MediationManagerWrapper.shared.manager?.presentRewardedAd(
            fromRootViewController: UIApplication.shared.delegate!.window!!.rootViewController!,
            callback: createJSAdCallback("Rewarded", callbackId)
        )
    }
    
    @objc func enableAppReturnAds(_ callbackId: NSString) {
        let key = UUID().uuidString;
        let cb = JSAppReturn(callbackId: callbackId as String) { [weak self] name, body in
            self?.sendEvent(withName: name, body: body)
            
            // cleanup memory
            if name == "onClosed" || name == "onShowFailed" {
                self?.callbacks.removeValue(forKey: key)
            }
        }
        
        callbacks[key] = cb
        
        MediationManagerWrapper.shared.manager?.enableAppReturnAds(with: cb)
    }
    
    @objc func disableAppReturnAds() {
        MediationManagerWrapper.shared.manager?.disableAppReturnAds()
    }
    
    @objc func skipNextAppReturnAds() {
        MediationManagerWrapper.shared.manager?.skipNextAppReturnAds()
    }
    
    @objc func loadAppOpenAd(_ isLandscape: Bool) {
        appOpenAd?.loadAd() {[weak self] ad, error in
            if let error = error {
                self?.sendEvent(withName: "adFailedToLoad", body: [
                    "type": MediationManagerModule.APP_OPEN_AD_TYPE,
                    "error": error.localizedDescription
                ])
            } else {
                self?.sendEvent(withName: "adLoaded", body: [
                    "type": MediationManagerModule.APP_OPEN_AD_TYPE
                ])
            }
        }
    }
    
    @objc func isAppOpenAdAvailable(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        resolve(appOpenAd?.isAdAvailable())
    }
    
    @objc func showAppOpenAd(_ callbackId: NSString) {
        appOpenAd?.contentCallback = createJSAdCallback("AppOpen", callbackId)
        appOpenAd?.present(fromRootViewController: UIApplication.shared.delegate!.window!!.rootViewController!)
    }
    
    private func createJSAdCallback(_ module: String, _ callbackId: NSString) -> CASCallback {
        let key = UUID().uuidString
        let callback = JSAdCallback(callbackId: callbackId as String) { [weak self] name, body in
            self?.sendEvent(withName: name, body: body)
            
            // cleanup memory
            if name == "onClosed" || name == "onShowFailed" {
                self?.callbacks.removeValue(forKey: key)
            }
        }
        
        callbacks[key] = callback
        
        return callback
    }
    
    func onAdLoaded(_ adType: CleverAdsSolutions.CASType) {
        sendEvent(withName: "adLoaded", body: [
            "type": adType.rawValue
        ])
    }
    
    func onAdFailedToLoad(_ adType: CleverAdsSolutions.CASType, withError error: String?) {
        sendEvent(withName: "adFailedToLoad", body: [
            "type": adType.rawValue,
            "error": error as Any
        ])
    }
    
    override func invalidate() {
        MediationManagerWrapper.shared.removeLoadListener(subId)
        MediationManagerWrapper.shared.removeChangeListener(changeId)
        super.invalidate()
    }
}

class JSAdCallback: CASPaidCallback {
    private let callbackId: String
    private let sendEvent: (_ eventName: String, _ body: Any) -> Void
    
    init(callbackId: String, sendEvent: @escaping (_ eventName: String, _ body: Any) -> Void) {
        self.callbackId = callbackId
        self.sendEvent = sendEvent
    }
    
    func didPayRevenue(for ad: CleverAdsSolutions.CASImpression) {
        sendEvent("onAdRevenuePaid", [
            "callbackId": callbackId,
            "data": ad.toDictionary() as Any
        ])
    }
    
    func willShown(ad adStatus: CASImpression) {
        sendEvent("onShown", [
            "callbackId": callbackId,
            "data": adStatus.toDictionary() as Any
        ])
    }
    
    func didClosedAd() {
        sendEvent("onClosed", [
            "callbackId": callbackId,
        ])
    }
    
    func didClickedAd() {
        sendEvent("onClicked", [
            "callbackId": callbackId,
        ])
    }
    
    func didCompletedAd() {
        sendEvent("onComplete", [
            "callbackId": callbackId,
        ])
    }
    
    func didShowAdFailed(error: String) {
        sendEvent("onShowFailed", [
            "callbackId": callbackId,
            "data": error
        ])
    }
}

class JSAppReturn: JSAdCallback, CASAppReturnDelegate {
    func viewControllerForPresentingAppReturnAd() -> UIViewController {
        return UIApplication.shared.delegate!.window!!.rootViewController!
    }
}
