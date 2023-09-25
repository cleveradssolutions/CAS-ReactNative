require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name         = "react-native-cas"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]
  s.framework    = "CleverAdsSolutions"

  s.platforms    = { :ios => "12.0" }
  s.source       = { :git => "https://github.com/TheLonelyAstronaut/react-native-cas.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"

  s.static_framework = true

  s.dependency 'CleverAdsSolutions-Base', '~> 3.2.5'

  if ENV['ENABLE_OPTIMAL'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/Optimal', '~> 3.2.5'
  end

  if ENV['ENABLE_FAMILIES'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/Families', '~> 3.2.5'
  end

  if ENV['ENABLE_GOOGLE'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/GoogleAds', '~> 3.2.5'
  end

  if ENV['ENABLE_UNITY'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/UnityAds', '~> 3.2.5'
  end

  if ENV['ENABLE_APPLOVIN'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/AppLovin', '~> 3.2.5'
  end

  if ENV['ENABLE_INMOBI'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/InMobi', '~> 3.2.5'
  end

  if ENV['ENABLE_ADCOLONY'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/AdColony', '~> 3.2.5'
  end

  if ENV['ENABLE_KIDOZ'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/Kidoz', '~> 3.2.5'
  end

  if ENV['ENABLE_SUPERAWESOME'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/SuperAwesome', '~> 3.2.5'
  end

  if ENV['ENABLE_VUNGLE'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/Vungle', '~> 3.2.5'
  end

  if ENV['ENABLE_PANGLE'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/Pangle', '~> 3.2.5'
  end

  if ENV['ENABLE_TAPJOY'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/Tapjoy', '~> 3.2.5'
  end

  if ENV['ENABLE_MINTEGRAL'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/Mintegral', '~> 3.2.5'
  end

  if ENV['ENABLE_IRONSOURCE'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/IronSource', '~> 3.2.5'
  end

  if ENV['ENABLE_MYTARGET'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/MyTarget', '~> 3.2.5'
  end

  if ENV['ENABLE_AUDIENCENETWORK'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/AudienceNetwork', '~> 3.2.5'
  end

  if ENV['ENABLE_YANDEXADS'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/YandexAds', '~> 3.2.5'
  end

  if ENV['ENABLE_CHARTBOOST'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/Chartboost', '~> 3.2.5'
  end

  if ENV['ENABLE_DIGITALTURBINE'] == '1' then
    s.dependency 'CleverAdsSolutions-SDK/DigitalTurbine', '~> 3.2.5'
  end

  if ENV['ENABLE_CROSSPROMO'] == '1' then
      s.dependency 'CleverAdsSolutions-SDK/CrossPromo', '~> 3.2.5'
    end

  # Use install_modules_dependencies helper to install the dependencies if React Native version >=0.71.0.
  # See https://github.com/facebook/react-native/blob/febf6b7f33fdb4904669f99d795eba4c0f95d7bf/scripts/cocoapods/new_architecture.rb#L79.
  if respond_to?(:install_modules_dependencies, true)
    install_modules_dependencies(s)
  else
  s.dependency "React-Core"

  # Don't install the dependencies when we run `pod install` in the old architecture.
  if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
    s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
    s.pod_target_xcconfig    = {
        "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
        "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
        "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
    }
    s.dependency "React-RCTFabric"
    s.dependency "React-Codegen"
    s.dependency "RCT-Folly"
    s.dependency "RCTRequired"
    s.dependency "RCTTypeSafety"
    s.dependency "ReactCommon/turbomodule/core"
   end
  end
end
