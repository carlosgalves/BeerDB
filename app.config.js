const IS_DEV = process.env.APP_VARIANT === 'development';

module.exports = {
  expo: {
    name: IS_DEV ? 'BeerDB (Dev)' : 'BeerDB',
    slug: 'beerdb',
    version: "0.1.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: IS_DEV ? 'com.carlosgalves.beerdb.dev' : 'com.carlosgalves.beerdb'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: IS_DEV ? 'com.carlosgalves.beerdb.dev' : 'com.carlosgalves.beerdb'
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "efb505ce-2fc7-4e9a-9234-802712fc1204"
      },
      buildNumber: "4"
    },
    owner: "carlosgalves",
    runtimeVersion: {
      policy: "appVersion"
    },
    updates: {
      checkAutomatically: "ON_LOAD",
      requestHeaders: {
        "expo-channel-name": "preview"
      },
      url: "https://u.expo.dev/efb505ce-2fc7-4e9a-9234-802712fc1204"
    }
  }
};
