module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for Expo Router
      'expo-router/babel',
      // Required for React Native Reanimated
      'react-native-reanimated/plugin',
    ],
  };
};
