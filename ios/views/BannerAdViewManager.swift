import CleverAdsSolutions

@objc(BannerAdViewManager)
class BannerAdViewManager: RCTViewManager {
  override func view() -> (BannerAdView) {
      return BannerAdView()
  }
    
  @objc func loadNextAd(_ reactTag: NSNumber) {
      bridge.uiManager.addUIBlock { uiManager, viewRegistry in
          if viewRegistry != nil {
              let banner: BannerAdView = viewRegistry![reactTag] as! BannerAdView
              
              banner.loadNextAd()
          }
      }
  }
    
  @objc func isAdReady(_ reactTag: NSNumber) {
      bridge.uiManager.addUIBlock { uiManager, viewRegistry in
          if viewRegistry != nil {
              let banner: BannerAdView = viewRegistry![reactTag] as! BannerAdView
                
              banner.isAdReadyEvent()
          }
      }
  }

  @objc override static func requiresMainQueueSetup() -> Bool {
      return true
  }
}

class BannerAdView: UIView, CASBannerDelegate {
    private var view: CASBannerView
    private var subId: String = ""
    
    @objc var onAdViewLoaded: RCTBubblingEventBlock?
    @objc var onAdViewFailed: RCTBubblingEventBlock?
    @objc var onAdViewClicked: RCTBubblingEventBlock?
    @objc var isAdReady: RCTBubblingEventBlock?
    @objc var onAdViewPresented: RCTBubblingEventBlock?
    
    func loadNextAd() {
        view.loadNextAd()
    }
    
    func isAdReadyEvent() {
        isAdReady?([
            "isAdReady": view.isAdReady
        ])
    }
    
    @objc func setSize(_ val: NSDictionary) {
        let size = val["size"] as? String
        
        switch(size) {
        case "LEADERBOARD":
            view.adSize = CASSize.leaderboard
        case "MEDIUM_RECTANGLE":
            view.adSize = CASSize.mediumRectangle
        case "ADAPTIVE":
            view.adSize = CASSize.getAdaptiveBanner(forMaxWidth: val["maxWidthDpi"] as? Double ?? 0)
        case "SMART":
            view.adSize = CASSize.getSmartBanner()
        default:
            view.adSize = CASSize.banner
        }
    }
    
    @objc func setRefreshInterval(_ val: NSNumber) {
        if val.intValue == 0 {
            view.disableAdRefresh()
        } else {
            view.refreshInterval = val.intValue
        }
    }
    
    @objc func setIsAutoloadEnabled(_ val: Bool) {
        view.isAutoloadEnabled = val
    }
    
    init() {
        view = CASBannerView(adSize: CASSize.banner, manager: MediationManagerWrapper.shared.manager)
        view.rootViewController = UIApplication.shared.delegate?.window??.rootViewController
        
        super.init(frame: .zero)
        
        subId = MediationManagerWrapper.shared.addChangeListener { self.view.manager = $0 }
        view.adDelegate = self
        addSubview(view)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    func bannerAdViewDidLoad(_ view: CASBannerView){
        onAdViewLoaded?(nil)
    }

    func bannerAdView(_ adView: CASBannerView, didFailWith error: CASError){
        onAdViewFailed?([
            "message": error.message,
            "code": error.errorCode
        ])
    }

    func bannerAdView(_ adView: CASBannerView, willPresent impression: CASImpression){
        onAdViewPresented?(impression.toDictionary())
    }

    func bannerAdViewDidRecordClick(_ adView: CASBannerView){
        onAdViewClicked?(nil)
    }
    
    override func willRemoveSubview(_ subview: UIView) {
        MediationManagerWrapper.shared.removeChangeListener(subId)
        view.destroy()
    }
}
