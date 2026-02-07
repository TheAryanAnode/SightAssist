module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@services': './src/services',
            '@contexts': './src/contexts',
            '@utils': './src/utils',
            '@assets': './src/assets'
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};
