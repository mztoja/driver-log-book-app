module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Wtyczkę worklets (Reanimated 4) dodaje automatycznie babel-preset-expo,
    // gdy zainstalowany jest react-native-worklets – nie dodajemy jej ręcznie.
  };
};
