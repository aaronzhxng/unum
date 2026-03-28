const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [/scripts\/.*/];

config.resolver.extraNodeModules = {
  "react-native-reanimated/scripts/validate-worklets-version": path.resolve(
    __dirname,
    "node_modules/react-native-reanimated/scripts/validate-worklets-version.js",
  ),
};

module.exports = config;
