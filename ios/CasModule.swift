//
//  CasModule.swift
//  react-native-cas
//
//  Created by Lonely Astronaut on 20.09.23.
//

import Foundation
import CleverAdsSolutions

@objc(CasModule)
class CasModule: RCTEventEmitter  {
    @objc func buildManager(_ params: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        let builder = CAS.buildManager()
            .withFramework("React Native", version: "Unknown")
            .withCompletionHandler { result in
                MediationManagerWrapper.shared.manager = result.manager
                
                let response: [String: Any] = [
                    "error": result.error ?? "",
                    "countryCode": result.countryCode ?? "",
                    "isConsentRequired": result.isConsentRequired
                ]
                
                resolve(response)
            }
        
        if let userId = params["userId"] as? String {
            builder.withUserID(userId)
        }
        
        if let testMode = params["testMode"] as? Bool {
            builder.withTestAdMode(testMode)
        }
        
        if let adTypes = params["adTypes"] as? NSArray {
            builder.withAdTypes(adTypes.map { CASType(rawValue: $0 as! Int)! })
        }
        
        if let mediationExtra = params["mediationExtra"] as? NSDictionary {
            let key = mediationExtra["key"] as? String
            let value = mediationExtra["value"] as? String
            
            if key != nil && value != nil {
                builder.withMediationExtras(value!, forKey: key!)
            }
        }
        
        if let consentFlow = params["consentFlow"] as? NSDictionary {
            let enabled = consentFlow["enabled"] as? Bool
            
            if enabled == false {
                builder.withConsentFlow(CASConsentFlow(isEnabled: false))
            } else {
                let flow = CASConsentFlow(requestGDPR: consentFlow["requestGDPR"] as? Bool ?? false, requestATT: consentFlow["requestATT"] as? Bool ?? false)
                    .withPrivacyPolicy(consentFlow["privacyPolicy"] as? String)
                    .withViewControllerToPresent(UIApplication.shared.delegate?.window??.rootViewController)
                    .withCompletionHandler { result in
                        let response: [String: Any] = [
                            "status": result.rawValue,
                            "settings": CAS.settings
                        ]
                        
                        self.sendEvent(withName: "consentFlowDismissed", body: response)
                    }
                
                builder.withConsentFlow(flow)
                
                if let casId = params["casId"] as? String {
                    let _ = builder.create(withCasId: casId)
                    
                    DispatchQueue.main.async {
                        flow.present()
                    }
                }
            }
        } else {
            if let casId = params["casId"] as? String {
                let _ = builder.create(withCasId: casId)
            }
        }
    }
    
    @objc func showConsentFlow(_ params: NSDictionary, cb callback: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            CASConsentFlow(requestGDPR: params["requestGDPR"] as? Bool ?? false, requestATT: params["requestATT"] as? Bool ?? false)
                .withPrivacyPolicy(params["privacyPolicy"] as? String)
                .withViewControllerToPresent(UIApplication.shared.delegate?.window??.rootViewController)
                .withCompletionHandler { result in
                    let response: [String: Any] = [
                        "status": result.rawValue,
                        "settings": CAS.settings.toDictionary()
                    ]
                    
                    callback([response])
                }
                .present()
        }
    }

    @objc func getSdkVersion(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        resolve(CAS.getSDKVersion())
    }
    
    @objc func getTargetingOptions(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        resolve(CAS.targetingOptions.toDictionary())
    }
    
    @objc func setTargetingOptions(_ options: NSDictionary) {
        CAS.targetingOptions.fromDictionary(jsMap: options)
    }
    
    @objc func getSettings(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        resolve(CAS.settings.toDictionary())
    }
    
    @objc func setSettings(_ settings: NSDictionary) {
        CAS.settings.fromDictionary(jsMap: settings)
    }
    
    @objc func restartInterstitialInterval() {
        CAS.settings.restartInterstitialInterval()
    }
    
    @objc func debugValidateIntegration() {
        DispatchQueue.main.async {
            CAS.validateIntegration()
        }
    }
    
    override func supportedEvents() -> [String]! {
        ["consentFlowDismissed"]
    }
    
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func addListener(_ eventName: String!) {
        super.addListener(eventName)
    }
    
    override func removeListeners(_ count: Double) {
        super.removeListeners(count)
    }
}
