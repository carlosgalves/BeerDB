import { ConfigContext, ExpoConfig } from "expo/config";
import { version } from "./package.json";

const EAS_PROJECT_ID = "efb505ce-2fc7-4e9a-9234-802712fc1204";
const PROJECT_SLUG = "beerdb";
const OWNER = "carlosgalves";

const APP_NAME = "BeerDB";
const BUNDLE_IDENTIFIER = "com.carlosgalves.beerdb";
const PACKAGE_NAME = "com.carlosgalves.beerdb";
const ICON = "./assets/images/icon.png";
const ADAPTIVE_ICON = "./assets/images/adaptive-icon.png";
const SCHEME = "beerdb";
const UPDATE_URL = `https://u.expo.dev/${EAS_PROJECT_ID}`;

export default ({ config }: ConfigContext): ExpoConfig => {
  const environment =
    (process.env.APP_ENV as "development" | "preview" | "production") ||
    "development";

  console.log("Building app for environment:", environment);

  const dynamicConfig = getDynamicAppConfig(environment);

  return {
    ...config,
    name: dynamicConfig.name,
    version,
    slug: PROJECT_SLUG,
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    icon: dynamicConfig.icon,
    scheme: dynamicConfig.scheme,
    ios: {
      supportsTablet: true,
      bundleIdentifier: dynamicConfig.bundleIdentifier,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: dynamicConfig.adaptiveIcon,
        backgroundColor: "#ffffff",
      },
      package: dynamicConfig.packageName,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    updates: dynamicConfig.updates ?? {
      url: UPDATE_URL, // fallback
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: EAS_PROJECT_ID,
      },
      buildNumber: "8",
    },
    owner: OWNER,
    runtimeVersion: "1.0.0",
  };
};

// Dynamically configure the app based on the environment.
export const getDynamicAppConfig = (
  environment: "development" | "preview" | "production"
) => {
  const baseConfig = {
    url: UPDATE_URL,
    checkAutomatically: "ON_LOAD",
  };

  if (environment === "production") {
    return {
      name: APP_NAME,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      packageName: PACKAGE_NAME,
      icon: ICON,
      adaptiveIcon: ADAPTIVE_ICON,
      scheme: SCHEME,
    };
  }

  if (environment === "preview") {
    return {
      name: `${APP_NAME} Preview`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER}.preview`,
      packageName: `${PACKAGE_NAME}.preview`,
      icon: ICON,
      adaptiveIcon: ADAPTIVE_ICON,
      scheme: `${SCHEME}-preview`,
      updates: {
        ...baseConfig,
        requestHeaders: {
          "expo-channel-name": "preview",
        },
        url: UPDATE_URL,
      },
    };
  }

  return {
    name: `${APP_NAME} DEV`,
    bundleIdentifier: `${BUNDLE_IDENTIFIER}.dev`,
    packageName: `${PACKAGE_NAME}.dev`,
    icon: ICON,
    adaptiveIcon: ADAPTIVE_ICON,
    scheme: `${SCHEME}-dev`,
    updates: {
      ...baseConfig,
      requestHeaders: {
        "expo-channel-name": "development",
      },
      url: UPDATE_URL,
    },
  };
};
