import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import FirebaseCore
import FirebaseAuth

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Required for @react-native-firebase — auto-init from GoogleService-Info.plist
    if FirebaseApp.app() == nil {
      FirebaseApp.configure()
    }

    // Fail fast with a clear log if Phone Auth URL scheme is missing from this build
    let expectedScheme = "app-1-389408462262-ios-080a05ea9cc45d1323dd17"
    let urlTypes = Bundle.main.object(forInfoDictionaryKey: "CFBundleURLTypes") as? [[String: Any]] ?? []
    let schemes = urlTypes.flatMap { ($0["CFBundleURLSchemes"] as? [String]) ?? [] }
    if schemes.contains(where: { $0.lowercased() == expectedScheme }) {
      print("[Firebase] Phone Auth URL scheme OK: \(expectedScheme)")
    } else {
      print("[Firebase] FATAL CONFIG: Phone Auth URL scheme missing from Info.plist in this build.")
      print("[Firebase] Expected: \(expectedScheme)")
      print("[Firebase] Found schemes: \(schemes)")
    }

    application.registerForRemoteNotifications()

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "ahzarman",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  // Handle Firebase Phone Auth reCAPTCHA redirect back into the app
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    if Auth.auth().canHandle(url) {
      return true
    }
    return false
  }

  func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    if Auth.auth().canHandleNotification(userInfo) {
      completionHandler(.noData)
      return
    }
    completionHandler(.noData)
  }

  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
#if DEBUG
    Auth.auth().setAPNSToken(deviceToken, type: .sandbox)
#else
    Auth.auth().setAPNSToken(deviceToken, type: .prod)
#endif
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
